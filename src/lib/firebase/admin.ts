import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App | undefined;
let cachedDb: Firestore | undefined;
let cachedAuth: Auth | undefined;

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

export function getAdminAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(getAdminApp());
  }
  return cachedAuth;
}
