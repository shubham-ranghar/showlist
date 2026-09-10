# Shortlist Project Notes

## What's new

- **Public landing page with email waitlist**: Built a landing page where users can join a waitlist by submitting their email. The waitlist data is stored in Firestore via a server-side API route (`/api/waitlist`).

- **Board for feature ideas**: Created a board page where signed-in users can post feature ideas and upvote them. The board updates in real-time using Firestore listeners.

- **Transaction-based voting**: Implemented voting using Firestore transactions to ensure one vote per user. This prevents race conditions and ensures data consistency.

- **Ownership-based delete rules**: Set up Firestore security rules (`firestore.rules`) so that only the creator of an idea can delete it. This is enforced at the database level, not just in the UI.

## How AI was used

### What AI did right
- Set up the basic Next.js project structure with TypeScript and Tailwind CSS
- Configured Firebase client SDK for authentication and Firestore
- Created the waitlist API route with proper validation and error handling
- Implemented the board UI with real-time updates using Firestore listeners
- Wrote Firestore security rules for ownership-based access control

### Where AI got wrong
1. **Waitlist route using in-memory Set**: Initially, the waitlist API route used a JavaScript `Set` to store emails in memory. This was completely wrong - it didn't persist data and never wrote to Firestore. I had to fix this by replacing it with proper Firestore writes using the Admin SDK.

2. **FIREBASE_SERVICE_ACCOUNT malformed JSON**: The environment variable `FIREBASE_SERVICE_ACCOUNT` had the JSON value formatted as a multi-line object with line breaks and indentation. This caused a JSON.parse error when the Firebase Admin SDK tried to initialize. I had to fix this by ensuring the JSON is on a single line with properly escaped newlines in the `private_key` field.

3. **AuthProvider not wrapped in layout.tsx**: The `AuthProvider` component wasn't wrapping the app in `layout.tsx`, which caused the board page to get stuck on "Loading..." because the auth context wasn't available. I had to add the `AuthProvider` wrapper to fix this.

### Where I overruled AI
- I decided to keep the implementation simple and focus on core features rather than adding extra polish that wasn't necessary for a working prototype.

## Where I got stuck and how I got past it

1. **Waitlist data not persisting**: The waitlist was using an in-memory `Set`, so data disappeared on every server restart. I fixed this by implementing proper Firestore writes using the Firebase Admin SDK in the API route.

2. **Firebase Admin SDK initialization failing**: The `FIREBASE_SERVICE_ACCOUNT` environment variable had malformed JSON (multi-line with indentation). I fixed this by reformatting it as a single-line JSON string with properly escaped newlines in the `private_key` field.

3. **Board stuck on "Loading..."**: The auth context wasn't available because `AuthProvider` wasn't wrapping the app in `layout.tsx`. I added the wrapper to make the auth context available throughout the app.

4. **.env.local file corruption**: When trying to fix the FIREBASE_SERVICE_ACCOUNT JSON, the file kept getting corrupted with line breaks inserted. I eventually fixed this by using PowerShell to properly write the single-line JSON.

## What was cut

- **Google Sign-In**: I explored adding Google Sign-In authentication but decided to skip it to keep the implementation simple. Currently, only Email/Password authentication is supported.

## What's known fragile

- **Firebase Spark/free plan limits**: The project is using Firebase's free Spark plan, which has limits on reads, writes, and concurrent connections. This might cause issues if the app gets significant traffic.

- **Edge cases not fully tested**: Some edge cases like network failures during voting, or rapid successive votes, might not be fully handled. The transaction-based voting should help, but more testing would be needed.

## What I'd do with another week

- Add Google Sign-In authentication as an alternative to Email/Password
- Implement email verification for new user accounts
- Add more comprehensive error handling and user feedback
- Add unit tests for the API routes and Firestore operations
- Improve the UI/UX with better loading states and animations
- Add a way for users to edit their own ideas (not just delete them)
- Implement pagination or infinite scroll for the board if there are many ideas
- Add search/filter functionality for the board
- Set up proper deployment (currently running locally)
