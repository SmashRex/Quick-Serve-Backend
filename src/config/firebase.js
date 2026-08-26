import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

function loadServiceAccount() {
  // Prefer the JSON directly from an env var — this is what deployment
  // platforms like Render need, since they don't let you upload arbitrary
  // secret files to the filesystem. Fall back to a file path for local dev,
  // where keeping a gitignored JSON file is often more convenient.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!fs.existsSync(path)) {
      throw new Error(`Firebase service account file not found at: ${path}`);
    }
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }

  throw new Error(
    'Missing Firebase credentials: set either FIREBASE_SERVICE_ACCOUNT_JSON (recommended for deployment) or FIREBASE_SERVICE_ACCOUNT_PATH (for local dev).'
  );
}

const serviceAccount = loadServiceAccount();

initializeApp({
  credential: cert(serviceAccount),
});

export const firestoreDb = getFirestore();
