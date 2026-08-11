import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfigData from "../firebase-applet-config.json";

// Safe fallback config
const firebaseConfig = firebaseConfigData || {
  projectId: "remote-sensing-497811",
  appId: "1:723096529784:web:80336d017a549323fcf68d",
  apiKey: "AIzaSyAUv-ukOwvWoCssVygDO-7UloWUrznZc9g",
  authDomain: "remote-sensing-497811.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-6113637f-b937-432f-b394-060fc31a3576",
  storageBucket: "remote-sensing-497811.firebasestorage.app",
  messagingSenderId: "723096529784"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Explicitly use the provisioned firestore database ID if present
const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
