import {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  deleteDoc,
  runTransaction,
  query,
  orderBy
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../firebase-config";
import { TravelRecord, PhotoMeta } from "../types";

export interface UserTravelData {
  countries: Record<string, TravelRecord>;
  regions: Record<string, TravelRecord>;
  countryPhotos: Record<string, PhotoMeta[]>;
  regionPhotos: Record<string, PhotoMeta[]>;
}

// Get all travel records and photo metadata for current user
export async function fetchUserTravelData(uid: string): Promise<UserTravelData> {
  const result: UserTravelData = {
    countries: {},
    regions: {},
    countryPhotos: {},
    regionPhotos: {}
  };

  try {
    // 1. Fetch countries
    const countriesRef = collection(db, "users", uid, "countries");
    const countriesSnap = await getDocs(countriesRef);
    for (const docSnap of countriesSnap.docs) {
      const code = docSnap.id;
      const data = docSnap.data();
      result.countries[code] = {
        visited: !!data.visited,
        visitCount: data.visitCount || 0,
        wishlist: !!data.wishlist,
        updatedAt: data.updatedAt || Date.now()
      };

      // Fetch photo metadata for this country
      const photosRef = collection(db, "users", uid, "countries", code, "photos");
      const photosQuery = query(photosRef, orderBy("createdAt", "asc"));
      const photosSnap = await getDocs(photosQuery);
      const photosList: PhotoMeta[] = [];
      photosSnap.forEach(pSnap => {
        photosList.push(pSnap.data() as PhotoMeta);
      });
      if (photosList.length > 0) {
        result.countryPhotos[code] = photosList;
      }
    }

    // 2. Fetch regions
    const regionsRef = collection(db, "users", uid, "regions");
    const regionsSnap = await getDocs(regionsRef);
    for (const docSnap of regionsSnap.docs) {
      const code = docSnap.id;
      const data = docSnap.data();
      result.regions[code] = {
        visited: !!data.visited,
        visitCount: data.visitCount || 0,
        wishlist: !!data.wishlist,
        updatedAt: data.updatedAt || Date.now()
      };

      // Fetch photo metadata for this region
      const photosRef = collection(db, "users", uid, "regions", code, "photos");
      const photosQuery = query(photosRef, orderBy("createdAt", "asc"));
      const photosSnap = await getDocs(photosQuery);
      const photosList: PhotoMeta[] = [];
      photosSnap.forEach(pSnap => {
        photosList.push(pSnap.data() as PhotoMeta);
      });
      if (photosList.length > 0) {
        result.regionPhotos[code] = photosList;
      }
    }
  } catch (err) {
    console.error("Error fetching user travel data:", err);
  }

  return result;
}

// Atomically increment or decrement visitCount
export async function updateVisitCount(
  uid: string,
  targetCode: string,
  targetType: 'country' | 'region',
  delta: number, // +1 or -1
  currentPhotos: PhotoMeta[]
): Promise<{ updatedRecord: TravelRecord; remainingPhotos: PhotoMeta[] }> {
  const collectionName = targetType === 'country' ? 'countries' : 'regions';
  const targetDocRef = doc(db, "users", uid, collectionName, targetCode);

  let newVisitCount = 0;
  let newVisited = false;

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(targetDocRef);
    const existing = docSnap.data() || { visitCount: 0, visited: false, wishlist: false };
    
    const currCount = existing.visitCount || 0;
    newVisitCount = Math.max(0, currCount + delta);
    newVisited = newVisitCount >= 1;

    transaction.set(targetDocRef, {
      visited: newVisited,
      visitCount: newVisitCount,
      wishlist: newVisited ? false : existing.wishlist, // Visited clears wishlist
      updatedAt: Date.now()
    }, { merge: true });
  });

  const updatedRecord: TravelRecord = {
    visited: newVisited,
    visitCount: newVisitCount,
    wishlist: false,
    updatedAt: Date.now()
  };

  // Check if photos exceed newVisitCount
  let remainingPhotos = [...currentPhotos];

  if (currentPhotos.length > newVisitCount) {
    // Sort photos by createdAt descending (newest first) to delete most recent photos first
    const sortedPhotos = [...currentPhotos].sort((a, b) => b.createdAt - a.createdAt);
    const excessCount = currentPhotos.length - newVisitCount;
    const photosToDelete = sortedPhotos.slice(0, excessCount);

    for (const photo of photosToDelete) {
      await deletePhoto(uid, targetCode, targetType, photo.photoId, photo.storagePath);
    }

    remainingPhotos = sortedPhotos.slice(excessCount).sort((a, b) => a.createdAt - b.createdAt);
  }

  return { updatedRecord, remainingPhotos };
}

// Set state directly to visited (count = 1) or toggle wishlist
export async function setTravelStatus(
  uid: string,
  targetCode: string,
  targetType: 'country' | 'region',
  action: 'visited' | 'wishlist' | 'clear',
  currentPhotos: PhotoMeta[] = []
): Promise<{ updatedRecord: TravelRecord; remainingPhotos: PhotoMeta[] }> {
  const collectionName = targetType === 'country' ? 'countries' : 'regions';
  const targetDocRef = doc(db, "users", uid, collectionName, targetCode);

  let updatedRecord: TravelRecord = { visited: false, visitCount: 0, wishlist: false, updatedAt: Date.now() };
  let remainingPhotos = [...currentPhotos];

  if (action === 'visited') {
    updatedRecord = {
      visited: true,
      visitCount: 1,
      wishlist: false,
      updatedAt: Date.now()
    };
    await setDoc(targetDocRef, updatedRecord, { merge: true });

    // Handle excess photos if currentPhotos > 1
    if (currentPhotos.length > 1) {
      const sortedPhotos = [...currentPhotos].sort((a, b) => b.createdAt - a.createdAt);
      const photosToDelete = sortedPhotos.slice(0, currentPhotos.length - 1);
      for (const photo of photosToDelete) {
        await deletePhoto(uid, targetCode, targetType, photo.photoId, photo.storagePath);
      }
      remainingPhotos = sortedPhotos.slice(currentPhotos.length - 1).sort((a, b) => a.createdAt - b.createdAt);
    }
  } else if (action === 'wishlist') {
    updatedRecord = {
      visited: false,
      visitCount: 0,
      wishlist: true,
      updatedAt: Date.now()
    };
    await setDoc(targetDocRef, updatedRecord, { merge: true });

    // Wishlist clears visited and deletes all photos
    for (const photo of currentPhotos) {
      await deletePhoto(uid, targetCode, targetType, photo.photoId, photo.storagePath);
    }
    remainingPhotos = [];
  } else if (action === 'clear') {
    updatedRecord = {
      visited: false,
      visitCount: 0,
      wishlist: false,
      updatedAt: Date.now()
    };
    await setDoc(targetDocRef, updatedRecord, { merge: true });

    for (const photo of currentPhotos) {
      await deletePhoto(uid, targetCode, targetType, photo.photoId, photo.storagePath);
    }
    remainingPhotos = [];
  }

  return { updatedRecord, remainingPhotos };
}

// Delete single photo from Storage and Firestore
export async function deletePhoto(
  uid: string,
  targetCode: string,
  targetType: 'country' | 'region',
  photoId: string,
  storagePath: string
): Promise<void> {
  const collectionName = targetType === 'country' ? 'countries' : 'regions';

  // 1. Delete from Firebase Storage if storagePath exists
  if (storagePath) {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn("Storage deletion warning (file may not exist):", err);
    }
  }

  // 2. Delete Firestore metadata document
  try {
    const photoDocRef = doc(db, "users", uid, collectionName, targetCode, "photos", photoId);
    await deleteDoc(photoDocRef);
  } catch (err) {
    console.error("Error deleting photo metadata from Firestore:", err);
  }
}

// Save photo metadata in Firestore
export async function savePhotoMetadata(
  uid: string,
  photoMeta: PhotoMeta
): Promise<void> {
  const collectionName = photoMeta.targetType === 'country' ? 'countries' : 'regions';
  const photoDocRef = doc(
    db,
    "users",
    uid,
    collectionName,
    photoMeta.targetCode,
    "photos",
    photoMeta.photoId
  );
  await setDoc(photoDocRef, photoMeta);
}
