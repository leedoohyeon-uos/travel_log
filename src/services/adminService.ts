import { db } from "../firebase-config";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export type UserRole = 'admin' | 'trial' | 'user';

export interface UserProfileDoc {
  uid: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Fetch a user profile document from Firestore 'users/{uid}'
 */
export async function fetchUserProfile(uid: string): Promise<UserProfileDoc | null> {
  if (!uid) return null;
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfileDoc;
      return {
        uid,
        email: data.email || '',
        role: data.role || 'user',
        password: data.password || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    }
  } catch (err) {
    console.error("Error fetching user profile from Firestore:", err);
  }
  return null;
}

/**
 * Ensure user document exists in Firestore 'users/{uid}'.
 * If it doesn't exist, create default document with role: 'user'.
 */
export async function ensureUserProfile(
  uid: string,
  email: string,
  password?: string
): Promise<UserProfileDoc> {
  const userRef = doc(db, "users", uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfileDoc;
      if (password && !data.password) {
        await setDoc(userRef, { password }, { merge: true });
      }
      return {
        uid,
        email: data.email || email,
        role: data.role || 'user',
        password: data.password || password || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } else {
      const newProfile: UserProfileDoc = {
        uid,
        email,
        role: 'user',
        password: password || '',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.warn("Could not ensure user profile in Firestore:", err);
    return {
      uid,
      email,
      role: 'user',
      password: password || ''
    };
  }
}

/**
 * Fetch all registered user documents from Firestore 'users' collection for Admin view.
 */
export async function fetchAllUserProfiles(): Promise<UserProfileDoc[]> {
  try {
    const usersRef = collection(db, "users");
    const snap = await getDocs(usersRef);
    const fetchedList: UserProfileDoc[] = [];
    snap.forEach(d => {
      const data = d.data();
      fetchedList.push({
        uid: d.id,
        email: data.email || 'No email',
        role: data.role || 'user',
        password: data.password || '',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });
    return fetchedList;
  } catch (err) {
    console.error("Error fetching user list from Firestore users collection:", err);
    return [];
  }
}
