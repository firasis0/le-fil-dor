import { useState } from "react";
import { MEASUREMENTS, validateMeasurement } from "../lib/measurements";
import { createOrder } from "../lib/orders";
import { ACCEPTED_TYPES, MAX_IMAGE_MB, compressImage, isValidPhone } from "../lib/utils";

const emptyMeasurements = { sleeves: "", chest: "", hips: "", length: "" };
// wilaya / commune hold the database ids (as text, because <select> values are text)
const emptyCustomer = { fullName: "", wilaya: "", commune: "", phone: "" };

// The BackEnd names some fields differently from the form. Used to show its errors on the right field.
const BACKEND_TO_FORM = {
  full_name: "fullName",
  model_image: "image",
  sleeve_length: "sleeves",
  garment_length: "length",
};

// Everything about the order form: values, validation, and sending it to the BackEnd.
export default function useOrderForm() {
  const [image, setImage] = useState(null); // { blob, dataUrl (preview address), name }
  const [measurements, setMeasurements] = useState(emptyMeasurements);
  const [customer, setCustomer] = useState(emptyCustomer);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | failed
  const [orderNumber, setOrderNumber] = useState("");
  const [failMessage, setFailMessage] = useState("");

  // ── image ──
  // Checks the file, shrinks it, and keeps it (plus a preview address) until the form is sent.
  async function chooseImage(file) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((e) => ({ ...e, image: "الصيغ المقبولة: JPG أو PNG أو WEBP" }));
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setErrors((e) => ({ ...e, image: `الحد الأقصى للصورة ${MAX_IMAGE_MB} ميغابايت` }));
      return;
    }
    try {
      const blob = await compressImage(file);
      if (image) URL.revokeObjectURL(image.dataUrl); // free the previous preview
      setImage({ blob, dataUrl: URL.createObjectURL(blob), name: file.name });
      setErrors((e) => ({ ...e, image: "" }));
    } catch {
      setErrors((e) => ({ ...e, image: "تعذّر قراءة الصورة، جرّبي صورة أخرى" }));
    }
  }

  // Remove the chosen photo
  function removeImage() {
    if (image) URL.revokeObjectURL(image.dataUrl);
    setImage(null);
  }

  // ── fields ──
  const setMeasurement = (key, value) => {
    setMeasurements((m) => ({ ...m, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // Changing the wilaya empties the commune (communes belong to one wilaya)
  const setCustomerField = (key, value) => {
    setCustomer((c) => (key === "wilaya" ? { ...c, wilaya: value, commune: "" } : { ...c, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // ── validation (quick checks in the browser; the BackEnd checks everything again) ──
  function validate() {
    const next = {};
    if (!image) next.image = "ارفعي صورة القفطان الذي ترغبين في تفصيله";
    MEASUREMENTS.forEach((def) => {
      const msg = validateMeasurement(def, measurements[def.key]);
      if (msg) next[def.key] = msg;
    });
    if (customer.fullName.trim().length < 3) next.fullName = "أدخلي اسمك الكامل";
    if (!customer.wilaya) next.wilaya = "اختاري الولاية";
    if (!customer.commune) next.commune = "اختاري البلدية";
    if (!isValidPhone(customer.phone)) next.phone = "رقم غير صحيح (مثال: 0550123456)";
    setErrors(next);
    return next;
  }

  // Builds the multipart form the BackEnd expects (names = BackEnd field names)
  function buildFormData() {
    const data = new FormData();
    data.append("full_name", customer.fullName.trim());
    data.append("phone", customer.phone);
    data.append("wilaya", customer.wilaya);
    data.append("commune", customer.commune);
    data.append("model_image", image.blob, "model.jpg");
    data.append("chest", measurements.chest);
    data.append("hips", measurements.hips);
    data.append("sleeve_length", measurements.sleeves);
    data.append("garment_length", measurements.length);
    return data;
  }

  // Validates, then sends. Returns { ok } or { ok:false, firstError } so the page can scroll to the problem.
  async function submit() {
    const found = validate();
    if (Object.keys(found).length) return { ok: false, firstError: Object.keys(found)[0] };

    setStatus("sending");
    setFailMessage("");
    try {
      const order = await createOrder(buildFormData());
      setOrderNumber(order.order_number);
      setStatus("done");
      return { ok: true };
    } catch (error) {
      // Show the BackEnd's complaints on the matching fields
      const mapped = {};
      for (const [key, message] of Object.entries(error.fields ?? {})) {
        mapped[BACKEND_TO_FORM[key] ?? key] = message;
      }
      setErrors(mapped);
      setFailMessage(Object.keys(mapped).length ? "تحقّقي من الحقول المُشار إليها" : error.message);
      setStatus("failed");
      return { ok: false, firstError: Object.keys(mapped)[0] };
    }
  }

  // Empty the form again (called when the thank-you popup closes)
  function reset() {
    removeImage();
    setMeasurements(emptyMeasurements);
    setCustomer(emptyCustomer);
    setErrors({});
    setStatus("idle");
    setOrderNumber("");
    setFailMessage("");
  }

  return {
    image,
    chooseImage,
    removeImage,
    measurements,
    setMeasurement,
    customer,
    setCustomerField,
    errors,
    status,
    orderNumber,
    failMessage,
    submit,
    reset,
  };
}
