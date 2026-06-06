import { db } from "@/shared/services/firebase/client";
import { COLLECTIONS, PORTFOLIO_COLLECTIONS } from "@/shared/constants/collections";
import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { uploadImage } from "@/shared/services/firebase/imageUpload";

export async function fetchCollectionEntries(collectionName) {
  const collectionQuery = query(collection(db, collectionName), orderBy("sortDate", "desc"));
  const snapshot = await getDocs(collectionQuery);
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
}

export async function fetchPortfolioOverview() {
  const [projects, experience, education] = await Promise.all([
    fetchCollectionEntries(COLLECTIONS.projects),
    fetchCollectionEntries(COLLECTIONS.experience),
    fetchCollectionEntries(COLLECTIONS.education),
  ]);

  return {
    projects,
    experience,
    education,
  };
}

export async function deletePortfolioEntry(collectionName, id) {
  if (!PORTFOLIO_COLLECTIONS.includes(collectionName)) {
    throw new Error(`Unknown collection: ${collectionName}`);
  }

  await deleteDoc(doc(db, collectionName, id));
}

export async function fetchPortfolioItem(collectionName, id) {
  const snapshot = await getDoc(doc(db, collectionName, id));
  if (!snapshot.exists()) {
    return null;
  }
  return { id: snapshot.id, ...snapshot.data() };
}

export async function appendGalleryImages(collectionName, id, files = []) {
  const uploads = [];

  for (const file of files) {
    const url = await uploadImage(file, {
      folder: `portfolio/${collectionName}/${id}/gallery`,
    });
    uploads.push({ src: url });
  }

  if (uploads.length) {
    await updateDoc(doc(db, collectionName, id), {
      gallery: arrayUnion(...uploads),
      updatedAt: serverTimestamp(),
    });
  }

  return uploads;
}

export async function saveGallery(collectionName, id, galleryItems) {
  await updateDoc(doc(db, collectionName, id), {
    gallery: galleryItems,
    updatedAt: serverTimestamp(),
  });
}

export async function updatePortfolioItem(collectionName, id, payload) {
  await updateDoc(doc(db, collectionName, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}
