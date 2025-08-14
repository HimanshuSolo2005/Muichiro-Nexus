"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createServiceSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { parsePdf, parseDocx, parseText, getSupportedFileTypes, getFileTypeCategory } from "@/lib/file-parsers"

/**
 * handles file upload to supabase storage and records metadata in the database.
 * @param formData - form data containing the file to upload.
 * @returns an object indicating success or failure, and a message.
 */
export async function uploadFile(formData: FormData) {
  const user = await currentUser()

  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  const file = formData.get("file") as File

  if (!file || file.size === 0) {
    return { success: false, message: "No file provided or file is empty." }
  }

  // checks if file type is supported....
  const supportedTypes = getSupportedFileTypes()
  if (!supportedTypes.includes(file.type)) {
    return {
      success: false,
      message: `File type ${file.type} is not supported. Supported types: ${supportedTypes.join(", ")}`,
    }
  }

  const supabase = createServiceSupabaseClient()

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_user_id", user.id)
    .single()

  if (userError || !userData) {
    console.error("Error fetching user ID from Supabase:", userError)
    return { success: false, message: "Could not find user in database." }
  }

  const supabaseUserId = userData.id
  const fileExtension = file.name.split(".").pop()
  const uniqueFileName = `${uuidv4()}.${fileExtension}`
  const filePath = `${supabaseUserId}/${uniqueFileName}`

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cloud-storage-files")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file to Supabase Storage:", uploadError)
      return { success: false, message: `File upload failed: ${uploadError.message}` }
    }

    const { data: fileMetadata, error: insertError } = await supabase.from("files").insert({
      user_id: supabaseUserId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
    })

    if (insertError) {
      console.error("Error inserting file metadata:", insertError)
      await supabase.storage.from("cloud-storage-files").remove([filePath])
      return { success: false, message: `Failed to record file metadata: ${insertError.message}` }
    }

    console.log("File uploaded and metadata recorded successfully:", fileMetadata)
    revalidatePath("/")
    return { success: true, message: "File uploaded successfully!" }
  } catch (e) {
    console.error("Unexpected error during file upload:", e)
    return { success: false, message: "An unexpected error occurred during file upload." }
  }
}

/**
 * generates a public download url for a given file path.
 * @param filePath - the path of the file in supabase storage.
 * @returns Aa object with success status, message, and the download URL.
 */
export async function getDownloadUrl(filePath: string) {
  const user = await currentUser()

  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  const supabase = createServiceSupabaseClient()

  try {
    const { data } = supabase.storage.from("cloud-storage-files").getPublicUrl(filePath)

    if (!data?.publicUrl) {
      return { success: false, message: "Could not generate public URL for file." }
    }

    return { success: true, message: "Download URL generated.", url: data.publicUrl }
  } catch (e) {
    console.error("Error generating download URL:", e)
    return { success: false, message: "An unexpected error occurred while generating download URL." }
  }
}

/**
 * deletes a file from supabase storage and its metadata from the database.
 * @param fileId - the id of the file in the public.files table.
 * @param filePath - the path of the file in supabase storage.
 * @returns an object indicating success or failure, and a message.
 */
export async function deleteFile(fileId: string, filePath: string) {
  const user = await currentUser()

  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  const supabase = createServiceSupabaseClient()

  try {
    const { error: storageError } = await supabase.storage.from("cloud-storage-files").remove([filePath])

    if (storageError) {
      console.error("Error deleting file from Supabase Storage:", storageError)
      return { success: false, message: `File deletion from storage failed: ${storageError.message}` }
    }

    const { error: dbError } = await supabase.from("files").delete().eq("id", fileId)

    if (dbError) {
      console.error("Error deleting file metadata from database:", dbError)
      return { success: false, message: `File metadata deletion failed: ${dbError.message}` }
    }

    console.log(`File ${fileId} and its metadata deleted successfully.`)
    revalidatePath("/")
    return { success: true, message: "File deleted successfully!" }
  } catch (e) {
    console.error("Unexpected error during file deletion:", e)
    return { success: false, message: "An unexpected error occurred during file deletion." }
  }
}

/**
 * analyzes a file using AI to extract summary, keywords, and metadata.
 * @param fileId - the ID of the file in the public.files table.
 * @returns an object indicating success or failure, and a message.
 */
export async function analyzeFile(fileId: string) {
  const user = await currentUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const supabase = createServiceSupabaseClient();

  try {
    const { data: fileData, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError || !fileData) {
      console.error("Error fetching file metadata:", fileError);
      return { success: false, message: "File not found." };
    }

    const { data: fileBuffer, error: downloadError } = await supabase.storage
      .from("cloud-storage-files")
      .download(fileData.file_path);

    if (downloadError || !fileBuffer) {
      console.error("Error downloading file:", downloadError);
      return { success: false, message: "Could not download file for analysis." };
    }

    let extractedText = "";
    const fileCategory = getFileTypeCategory(fileData.mime_type);

    // text extraction grom documents 
    if (fileCategory === "document") {
      try {
        const arrayBuffer = await fileBuffer.arrayBuffer();
        switch (fileData.mime_type) {
          case "text/plain":
            extractedText = await parseText(arrayBuffer);
            break;
          case "application/pdf":
            try {
              extractedText = await parsePdf(arrayBuffer);
            } catch (pdfError) {
              console.warn("PDF parsing failed:", pdfError);
              extractedText = `PDF document: ${fileData.file_name} (text extraction failed)`;
            }
            break;
          case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            extractedText = await parseDocx(arrayBuffer);
            break;
          default:
            throw new Error(`Unsupported document type: ${fileData.mime_type}`);
        }
      } catch (extractError) {
        console.error("Error extracting text:", extractError);
        extractedText = `Document: ${fileData.file_name} (content extraction failed)`;
      }
    }

    let aiResponse = "";

    // image-analysis here...
    if (fileCategory === "image") {
      const arrayBuffer = await fileBuffer.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = fileData.mime_type;

      const { text } = await generateText({
        model: groq("meta-llama/llama-4-scout-17b-16e-instruct"), // ✅ Vision-capable
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Respond only with valid JSON. No backticks, no explanations. JSON schema:
{
  "summary": "Max 200 chars",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "contentType": "photo|screenshot|diagram|artwork|chart|document|other",
  "language": "english",
  "imageDetails": {
    "mainSubjects": ["subject1", "subject2"],
    "colors": ["color1", "color2", "color3"],
    "setting": "indoor|outdoor|studio|unknown",
    "mood": "happy|serious|calm|energetic|neutral|dramatic",
    "objects": ["object1", "object2", "object3"],
    "people": ["description of people if any"],
    "text": "any text visible in the image"
  },
  "topics": ["topic1", "topic2", "topic3"],
  "technicalDetails": {
    "quality": "high|medium|low",
    "lighting": "excellent|good|poor|natural|artificial",
    "composition": "portrait|landscape|square",
    "style": "realistic|artistic|cartoon|professional|casual"
  },
  "context": {
    "location": "description of location if identifiable",
    "timeOfDay": "morning|afternoon|evening|night|unknown",
    "weather": "sunny|cloudy|rainy|snowy|unknown",
    "activity": "main activity happening"
  }
}`,
              },
              {
                type: "image",
                image: `data:${mimeType};base64,${base64Image}`,
              },
            ],
          },
        ],
      });

      aiResponse = text;

    // docs & text-analysis begin here...
    } else {
      const maxLength = 8000;
      const textToAnalyze =
        extractedText.length > maxLength
          ? extractedText.substring(0, maxLength) + "..."
          : extractedText;

      const analysisText =
        textToAnalyze.trim() ||
        `File: ${fileData.file_name}, Type: ${fileData.mime_type}, Size: ${fileData.file_size} bytes`;

      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"), //best for structured json
        prompt: `Respond only with valid JSON. No backticks, no explanations. JSON schema:
{
  "summary": "Max 2000 chars",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "contentType": "document|code|data|other",
  "language": "english|spanish|french|other",
  "wordCount": 1234,
  "topics": ["topic1", "topic2", "topic3"]
}

File name: ${fileData.file_name}
File type: ${fileData.mime_type}
Content to analyze:
${analysisText}`,
      });

      aiResponse = text;
    }

    // cleaning and outputing the ai result....
    const cleanResponse = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const aiMetadata = JSON.parse(jsonMatch[0]);
    aiMetadata.analyzedAt = new Date().toISOString();
    aiMetadata.extractedLength = extractedText.length;
    aiMetadata.fileSize = fileData.file_size;

    // metadata to be saved for furthur use....
    const { error: updateError } = await supabase
      .from("files")
      .update({
        ai_metadata: aiMetadata,
        ai_analyzed: true,
      })
      .eq("id", fileId);

    if (updateError) {
      console.error("Error saving AI metadata:", updateError);
      return { success: false, message: "Could not save analysis results." };
    }

    console.log("File analyzed successfully:", aiMetadata);
    revalidatePath("/");
    return { success: true, message: "File analyzed successfully!", metadata: aiMetadata };

  } catch (e) {
    console.error("Unexpected error during file analysis:", e);
    return { success: false, message: "An unexpected error occurred during analysis." };
  }
}
