import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/shared/services/firebase/client";

export const IMAGE_UPLOAD_LIMITS = {
  maxOriginalBytes: 10 * 1024 * 1024,
  maxCompressedBytes: 4 * 1024 * 1024,
  maxDimension: 1600,
  quality: 0.8,
};

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateImageFile(file) {
  if (!file) {
    throw new Error("Please choose an image to upload.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WebP image.");
  }

  if (file.size > IMAGE_UPLOAD_LIMITS.maxOriginalBytes) {
    throw new Error("Image is too large. Please upload an image under 10 MB.");
  }
}

export function isDataUrlImage(value) {
  return typeof value === "string" && /^data:image\/(png|jpe?g|webp);base64,/i.test(value);
}

export function dataUrlToFile(dataUrl, filename = "image.jpg") {
  if (!isDataUrlImage(dataUrl)) {
    throw new Error("This image format cannot be uploaded.");
  }

  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/^data:([^;]+);base64$/i)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mime });
}

export async function uploadImage(file, options = {}) {
  const { folder = "portfolio/images", onProgress } = options;
  validateImageFile(file);

  const compressedImage = await compressImage(file);
  const safeName = createSafeImageName(file.name, compressedImage.type);
  const fileRef = storageRef(storage, `${folder}/${safeName}`);

  const uploadTask = uploadBytesResumable(fileRef, compressedImage, {
    contentType: compressedImage.type,
    customMetadata: {
      originalName: file.name || "image",
      originalType: file.type || "unknown",
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        if (typeof onProgress !== "function") return;
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(progress);
      },
      (error) => {
        reject(new Error(getUploadErrorMessage(error)));
      },
      async () => {
        try {
          onProgress?.(100);
          resolve(await getDownloadURL(uploadTask.snapshot.ref));
        } catch (error) {
          reject(new Error(error?.message || "Image uploaded, but the download URL could not be created."));
        }
      }
    );
  });
}

async function compressImage(file) {
  const image = await loadImage(file);
  const { width, height } = getTargetSize(image.width, image.height, IMAGE_UPLOAD_LIMITS.maxDimension);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("Image compression is not supported in this browser.");
  }

  ctx.drawImage(image, 0, 0, width, height);

  const hasAlpha = ["image/png", "image/webp"].includes(file.type) ? imageHasTransparency(ctx, width, height) : false;
  const outputType = hasAlpha ? "image/png" : "image/jpeg";

  if (outputType === "image/jpeg") {
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = getCanvasFallbackColor();
    ctx.fillRect(0, 0, width, height);
  }

  const blob = await canvasToBlob(canvas, outputType, IMAGE_UPLOAD_LIMITS.quality);

  if (blob.size > IMAGE_UPLOAD_LIMITS.maxCompressedBytes) {
    throw new Error("Image is still too large after compression. Please choose a smaller image.");
  }

  return blob;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image could not be read. Please choose a different image."));
    };

    image.src = objectUrl;
  });
}

function getTargetSize(width, height, maxDimension) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function imageHasTransparency(ctx, width, height) {
  const pixels = ctx.getImageData(0, 0, width, height).data;

  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] < 255) return true;
  }

  return false;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Image compression failed. Please try another image."));
      },
      type,
      quality
    );
  });
}

function getCanvasFallbackColor() {
  if (typeof window === "undefined") {
    return "rgb(255 255 255)";
  }

  return (
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--color-paper-light")
      .trim() || "rgb(255 255 255)"
  );
}

function createSafeImageName(originalName, mimeType) {
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const baseName = (originalName || "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w.-]+/g, "_")
    .slice(0, 80);
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`;

  return `${Date.now()}_${id}_${baseName || "image"}.${extension}`;
}

function getUploadErrorMessage(error) {
  if (error?.code === "storage/unauthorized") {
    return "You do not have permission to upload images. Please sign in as admin.";
  }

  if (error?.code === "storage/canceled") {
    return "Image upload was canceled.";
  }

  if (error?.code === "storage/quota-exceeded") {
    return "Image upload failed because storage quota was exceeded.";
  }

  return error?.message || "Image upload failed. Please try again.";
}
