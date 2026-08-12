import { db } from "../firebase-config";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";

export interface UserAccountRegistryDoc {
  uid: string;
  email: string;
  password?: string;
  updatedAt?: number;
}

export const ADMIN_EMAIL = "0216top@uos.ac.kr";
export const ADMIN_PASSWORD = "dlengus0216!";
export const DEFAULT_TEST_EMAIL = "1234@gmail.com";
export const DEFAULT_TEST_PASSWORD = "123456";

// Pre-seeded fallback user accounts for Admin inspection
export const PRESEEDED_USER_ACCOUNTS: UserAccountRegistryDoc[] = [
  {
    email: "1234@gmail.com",
    password: "123456",
    uid: "test_user_1234_uid"
  },
  {
    email: "user1@example.com",
    password: "user1234",
    uid: "user1_uid"
  },
  {
    email: "traveler@gmail.com",
    password: "travel2026",
    uid: "traveler_uid"
  }
];

/**
 * Register or update user credentials in Firestore user registry for Admin review.
 */
export async function registerUserCredentials(email: string, password?: string, uid?: string): Promise<void> {
  if (!email || email === ADMIN_EMAIL) return;
  try {
    const docId = email.replace(/[@.]/g, '_');
    const userDocRef = doc(db, "user_registry", docId);
    await setDoc(userDocRef, {
      email,
      password: password || "123456",
      uid: uid || docId,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.warn("User registry sync warning:", err);
  }
}

/**
 * Fetch all registered user accounts for Admin user selector.
 */
export async function fetchAllUserCredentials(): Promise<UserAccountRegistryDoc[]> {
  try {
    const registryRef = collection(db, "user_registry");
    const snap = await getDocs(registryRef);
    const fetchedList: UserAccountRegistryDoc[] = [];
    snap.forEach(d => {
      fetchedList.push(d.data() as UserAccountRegistryDoc);
    });

    // Merge with preseeded accounts
    const combinedMap = new Map<string, UserAccountRegistryDoc>();
    PRESEEDED_USER_ACCOUNTS.forEach(u => combinedMap.set(u.email, u));
    fetchedList.forEach(u => combinedMap.set(u.email, u));

    return Array.from(combinedMap.values());
  } catch (err) {
    console.warn("Could not fetch user registry from Firestore, using default accounts:", err);
    return PRESEEDED_USER_ACCOUNTS;
  }
}
