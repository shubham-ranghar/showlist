Shortlist

A Next.js app with Firebase Auth and Firestore for managing feature ideas with a public waitlist and a signed-in board for posting and upvoting ideas.

## Live Demo

[https://showlist-lake.vercel.app](https://showlist-lake.vercel.app)

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore
- Firebase Admin SDK

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database
   - Go to Project Settings > Service Accounts > Generate New Private Key
   - Download the JSON file (you'll need this for the admin SDK)
   - Go to Authentication > Settings > Authorized domains and add your production Vercel domain (e.g., `your-app.vercel.app`) — this is required for auth to work in production

3. Create a `.env.local` file in the project root with the following environment variables:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...",...}
   ```

   - Get the `NEXT_PUBLIC_*` values from Firebase Console > Project Settings > General
   - For `FIREBASE_SERVICE_ACCOUNT`, copy the entire JSON content from the downloaded service account key file and paste it as a single line (no line breaks, with `\n` properly escaped in the `private_key` field)

4. Deploy Firestore security rules:
   - Go to Firebase Console > Firestore > Rules tab
   - Copy the contents of `firestore.rules` from this repository
   - Paste the rules into the Firestore Rules editor
   - Click "Publish" to apply the rules

5. Start the development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project can be deployed to Vercel. Make sure to add the environment variables in your Vercel project settings before deploying.

## Notes

- No part of the app is restricted to a specific account — any user can sign up and use all features.
- Firestore security rules (in `firestore.rules`) enforce one-vote-per-user, ownership-based delete, and server-only waitlist access.
