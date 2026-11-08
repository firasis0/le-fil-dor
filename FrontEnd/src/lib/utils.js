// Small helpers shared across the app.

// Join CSS class names, ignoring empty ones: cn('a', false, 'b') -> 'a b'
export const cn = (...names) => names.filter(Boolean).join(" ");

// Keep only digits (and drop anything else a user may paste into a phone field).
export const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");

// 0550123456 -> "05 50 12 34 56"
export function formatPhone(value) {
  const d = digitsOnly(value).slice(0, 10);
  return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

// Algerian mobile numbers: 05 / 06 / 07 followed by 8 digits.
export const isValidPhone = (value) => /^0[567]\d{8}$/.test(digitsOnly(value));

export const MAX_IMAGE_MB = 10;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Shrinks the photo in the browser BEFORE uploading it (phone photos can be 8 MB).
// Returns a JPEG Blob of at most `maxSide` pixels. The BackEnd optimises it once more.
export function compressImage(file, maxSide = 1600, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff"; // PNG transparency becomes white (JPEG has none)
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("image-failed"))), "image/jpeg", quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-load-failed"));
    };
    img.src = url;
  });
}

const dateFormatter = new Intl.DateTimeFormat("ar-DZ-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
// Format an ISO date for display, e.g. 8 نوفمبر 2026 في 04:52 ص
export const formatDate = (iso) => dateFormatter.format(new Date(iso));
