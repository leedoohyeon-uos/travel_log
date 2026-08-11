import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase-config";
import { PhotoMeta } from "../types";
import { savePhotoMetadata } from "./dbService";

/**
 * Compresses an image file in the browser using HTML5 Canvas.
 * Resizes max dimension to 1200px and converts to JPEG quality 0.80.
 */
export async function compressImage(file: File, maxDimension = 1200, quality = 0.80): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context creation failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Image compression failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image file"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a compressed image to Firebase Storage and returns PhotoMeta.
 */
export async function uploadTravelPhoto(
  uid: string,
  targetCode: string,
  targetType: 'country' | 'region',
  file: File
): Promise<PhotoMeta> {
  // 1. Compress image in browser
  const compressedBlob = await compressImage(file);

  // 2. Generate photo ID and storage path
  const photoId = "photo_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const collectionFolder = targetType === 'country' ? 'countries' : 'regions';
  const storagePath = `users/${uid}/${collectionFolder}/${targetCode}/${photoId}.jpg`;

  // 3. Upload to Firebase Storage
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, compressedBlob, { contentType: "image/jpeg" });

  // 4. Get Download URL
  const downloadURL = await getDownloadURL(storageRef);

  // 5. Create metadata object
  const photoMeta: PhotoMeta = {
    photoId,
    storagePath,
    downloadURL,
    createdAt: Date.now(),
    targetCode,
    targetType
  };

  // 6. Save metadata in Firestore
  await savePhotoMetadata(uid, photoMeta);

  return photoMeta;
}
