import * as admin from "firebase-admin";

// Only initialize if credentials are available (not during static build)
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;

if (!admin.apps.length) {
  if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    // Initialize with project ID only (no admin operations will work,
    // but the module won't crash during build/static generation)
    admin.initializeApp({ projectId: projectId || "placeholder" });
  }
}

// Lazy getters — only usable at request time when credentials are present
export const adminAuth = admin.apps[0] ? admin.auth() : null;
export const adminDb = admin.apps[0] ? admin.firestore() : null;
export default admin;
