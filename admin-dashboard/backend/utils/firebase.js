// =====================================================
// utils/firebase.js
//
// Initializes the Firebase Admin SDK.
// This runs ONCE when the server starts.
//
// Firebase Admin SDK lets the BACKEND:
//   ✅ Verify Firebase ID tokens sent from the frontend
//   ✅ Look up Firebase user accounts
//   ✅ Create/delete Firebase Auth users
//
// HOW THE TWO AUTH SYSTEMS WORK TOGETHER:
//
//   OPTION A — Express JWT (email + password you manage):
//     1. Admin logs in with POST /api/auth/login
//     2. Server checks password, returns a JWT token
//     3. Frontend sends: Authorization: Bearer <jwt_token>
//     4. verifyAdmin middleware validates it
//
//   OPTION B — Firebase Auth (Google Sign-In, email link, etc.):
//     1. Admin logs in through Firebase on the frontend
//     2. Firebase returns a Firebase ID Token
//     3. Frontend sends: Authorization: Bearer <firebase_id_token>
//     4. verifyFirebaseToken middleware validates it with Firebase SDK
//     5. Server finds/creates the admin record in MongoDB
//
// HOW TO GET YOUR FIREBASE SERVICE ACCOUNT:
//   1. Go to Firebase Console → Project Settings
//   2. Click "Service Accounts" tab
//   3. Click "Generate new private key"
//   4. Download the JSON file
//   5. Copy each value into your .env file
// =====================================================

const admin = require("firebase-admin");

let firebaseApp = null;

const initFirebase = () => {
  // Only initialize once — calling initialize() twice throws an error
  if (firebaseApp) return firebaseApp;

  // Check that all required Firebase env vars are present
  const required = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_CLIENT_EMAIL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Firebase not initialized. Missing .env vars: ${missing.join(", ")}`);
    console.warn("   Firebase auth routes will be disabled.");
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,

        // The private key has \n escape sequences in .env
        // .replace() converts them to real newlines
        privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),

        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId:    process.env.FIREBASE_CLIENT_ID,
        authUri:     "https://accounts.google.com/o/oauth2/auth",
        tokenUri:    "https://oauth2.googleapis.com/token",
        clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      }),
    });

    console.log("✅  Firebase Admin SDK initialized");
    return firebaseApp;

  } catch (err) {
    console.error("❌  Firebase initialization failed:", err.message);
    return null;
  }
};

// Verify a Firebase ID token sent from the frontend
// Returns the decoded token payload (contains uid, email, etc.)
// Returns null if the token is invalid or Firebase is not configured
const verifyFirebaseIdToken = async (idToken) => {
  if (!firebaseApp) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded; // { uid, email, name, picture, ... }
  } catch (err) {
    console.error("⚠️  Firebase token verification failed:", err.message);
    return null;
  }
};

// Get a Firebase user by their UID
const getFirebaseUser = async (uid) => {
  if (!firebaseApp) return null;
  try {
    return await admin.auth().getUser(uid);
  } catch {
    return null;
  }
};

// Revoke all refresh tokens for a Firebase user (force logout everywhere)
const revokeFirebaseTokens = async (uid) => {
  if (!firebaseApp) return;
  try {
    await admin.auth().revokeRefreshTokens(uid);
  } catch (err) {
    console.error("⚠️  Firebase token revocation failed:", err.message);
  }
};

module.exports = { initFirebase, verifyFirebaseIdToken, getFirebaseUser, revokeFirebaseTokens };