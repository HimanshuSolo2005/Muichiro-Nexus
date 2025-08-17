# Muichiro-Nexus: *A Cloud-Storage with AI Integration*

<img width="200" height="206" alt="image" src="https://github.com/user-attachments/assets/b45dc22b-fcc9-44f7-a7cd-6d5489d45ce4" />

---

## Project Checkpoints

### Development Checkpoints
- [x] Set up Next.js project structure
- [x] Integrate Noto Sans JP font for headings
- [x] Design Home Page UI
- [x] Created a Storage Bucket in supabase
- [x] Created the policies to allow only authenticated users to perform CRUD 
- [x] Just Created a separate branch for tetsing of supabase-clerk Integration for fetching and storing user details and generating a user Id in Supabase's User Table that i have previously created.
- [x] Finally created upload - file feature
- [x] File-Upload stuffs just take file from user and then it send that file to my supabase files-table just like clerk send user details to user-table in supabase.
- [x] After receiving data from frontend, supabase stores that file in my storage-bucket where i have full authority to Delete, Download and get link for uploaded files.
- [x] Took me hours but its finally done, I am done with integrating feature of file-display on frontend, was stuck with some RLS policy issues but have to just bypass it due to lack of time 😅.
- [x] File-deleting working properly on frontend.
- [x] Have some issues with file-downloading feat., no idea why it is failing to fetch the downloading-url of file from bucket, even my bucket is not-found LOL, I have to figure it out.
- [x] Fixed File Download feature.

---

## Getting Started with AI-Integration
### Here is a workflow...
<img width="1600" height="1000" alt="image" src="https://github.com/user-attachments/assets/d6b9b123-4d2d-48c8-8d77-d5381c8221f1" />

- [x] Started with integrating AI, have some roadmap in my mind..., will share it with a workflow...
- [x] Implemented these feature using Vercel's ai-sdk + groq.
- [x] First feature will be AI-Analysis which includes give the file to groq-sdk which analyze it and generate respone
- [x] Initialized Search feature by creating a `search.ts` server file in actions folder.
- [x] Using debouncing technique to prevent uneccesary javascript calls to server. Created a debouncing hook.
- [ ] Next step will be storing these response in form of a structured metadata which will be used for AI-Search feature later...
- [ ] Complete Implementing AI features
- [ ] Test responsiveness on mobile and desktop

### Deployment Checkpoints
- [ ] Deploy to Vercel 
- [ ] Update README.md with live demo link
- [ ] Add project to resume 
