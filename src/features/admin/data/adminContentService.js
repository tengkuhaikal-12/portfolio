import { db } from "@/shared/services/firebase/client";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function createPortfolioEntry(collectionName, payload) {
  return addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}
