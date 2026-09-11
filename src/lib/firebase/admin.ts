import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | undefined;
let cachedDb: Firestore | undefined;
let cachedAuth: any;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT env variable is missing. Check .env.local"
    );
  }
  return JSON.parse(raw);
}

/** Lazy singleton — initializes on first use, not at module import. */
function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  adminApp = existing.length
    ? existing[0]
    : initializeApp({
        credential: cert(getServiceAccount()),
      });

  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!cachedDb) {
    cachedDb = getFirestore(getAdminApp());
  }
  return cachedDb;
}

export async function getAdminAuth() {
  if (!cachedAuth) {
    const { getAuth } = await import('firebase-admin/auth');
    cachedAuth = getAuth(getAdminApp());
  }
  return cachedAuth;
}
