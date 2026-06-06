import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/shared/services/firebase/client";
import { APP_CONFIG_DOCS, COLLECTIONS } from "@/shared/constants/collections";

export const DEFAULT_HERO_PROFILE_IMAGE = "/profile.jpg";

function normalizeImage(value) {
  const image = typeof value === "string" ? value.trim() : "";
  return image || DEFAULT_HERO_PROFILE_IMAGE;
}

function normalizeUploadedImageUrl(value) {
  const image = typeof value === "string" ? value.trim() : "";

  if (!/^https?:\/\//i.test(image)) {
    throw new Error("Profile image upload did not return a valid image URL.");
  }

  return image;
}

function getHeroProfileRef() {
  return doc(db, COLLECTIONS.appConfig, APP_CONFIG_DOCS.heroProfile);
}

export function subscribeHeroProfile(onChange, onError) {
  return onSnapshot(
    getHeroProfileRef(),
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.data() : {};

      onChange?.({
        image: normalizeImage(data?.image),
        updatedAt: data?.updatedAt || null,
      });
    },
    (error) => {
      onError?.(error);
      onChange?.({
        image: DEFAULT_HERO_PROFILE_IMAGE,
        updatedAt: null,
      });
    }
  );
}

export async function updateHeroProfileImage(imageUrl) {
  const image = normalizeUploadedImageUrl(imageUrl);

  await setDoc(
    getHeroProfileRef(),
    {
      image,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return image;
}
