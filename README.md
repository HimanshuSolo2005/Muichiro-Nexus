9# Muichiro-Nexus: *A Cloud-Storage with AI Integration*

<img width="200" height="206" alt="image" src="https://github.com/user-attachments/assets/b45dc22b-fcc9-44f7-a7cd-6d5489d45ce4" />


## Project To-Do List

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
- [ ] Next I will be moving to most interesting part of my project - AI integration.
- [ ] Will deep dive into Vercel's ai-sdk
- [ ] Complete Implementing AI features
- [ ] Test responsiveness on mobile and desktop

### Deployment Checkpoints
- [ ] Deploy to Vercel 
- [ ] Update README.md with live demo link
- [ ] Add project to resume 
