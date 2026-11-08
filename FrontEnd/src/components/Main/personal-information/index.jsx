import { useEffect, useState } from "react";
import { Building2, ChevronDown, MapPin, Phone, User } from "lucide-react";
import SectionHeading from "../section-heading";
import { fetchCommunes, fetchWilayas } from "../../../lib/geography";
import { cn, digitsOnly, formatPhone } from "../../../lib/utils";
import styles from "./styles.module.scss";

// Small Algerian flag shown next to the +213 prefix
function AlgerianFlag() {
  return (
    <svg viewBox="0 0 30 20" className={styles.flag} aria-hidden="true">
      <rect width="15" height="20" fill="#0a7a3d" />
      <rect x="15" width="15" height="20" fill="#fff" />
      <circle cx="15" cy="10" r="5" fill="#d21034" />
      <circle cx="16.4" cy="10" r="4" fill="#fff" />
      <path
        d="m17.3 7.9.7 2-1.7-1.2h2.1l-1.7 1.2Z"
        fill="#d21034"
        transform="translate(-.4 .9) rotate(18 17.3 10)"
      />
    </svg>
  );
}

// A label + the input given as children + its error line
function Field({ id, label, error, children }) {
  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.label}>
        {label} <span aria-hidden="true">*</span>
      </label>
      {children}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Customer name, wilaya, commune and phone.
// The wilaya and commune lists are loaded from the BackEnd.
export default function PersonalInformation({ values, errors, onChange }) {
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);

  // Load the 58 wilayas once, when the page opens
  useEffect(() => {
    fetchWilayas()
      .then(setWilayas)
      .catch(() => setWilayas([]));
  }, []);

  // Load the communes each time another wilaya is chosen
  useEffect(() => {
    if (!values.wilaya) return;
    let cancelled = false; // ignore an old answer if the wilaya changed meanwhile
    fetchCommunes(values.wilaya)
      .then((list) => !cancelled && setCommunes(list))
      .catch(() => !cancelled && setCommunes([]));
    return () => {
      cancelled = true;
    };
  }, [values.wilaya]);

  // no wilaya chosen -> no communes (derived here instead of resetting the state)
  const communeOptions = values.wilaya ? communes : [];


  return (
    <section className={styles.card} aria-labelledby="step-info">
      <SectionHeading number="03" id="step-info" title="المعلومات الشخصية" icon={<User />} />

      <div className={styles.grid}>
        <Field id="field-fullName" label="الاسم الكامل" error={errors.fullName}>
          <div className={cn(styles.control, errors.fullName && styles.invalid)}>
            <User className={styles.icon} strokeWidth={1.5} />
            <input
              id="field-fullName"
              type="text"
              autoComplete="name"
              placeholder="أدخلي اسمك الكامل"
              value={values.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
            />
          </div>
        </Field>

        <Field id="field-wilaya" label="الولاية" error={errors.wilaya}>
          <div className={cn(styles.control, errors.wilaya && styles.invalid)}>
            <MapPin className={styles.icon} strokeWidth={1.5} />
            <select
              id="field-wilaya"
              value={values.wilaya}
              onChange={(e) => onChange("wilaya", e.target.value)}
              className={cn(!values.wilaya && styles.empty)}
            >
              <option value="">اختر الولاية</option>
              {wilayas.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.chevron} size={18} strokeWidth={1.8} />
          </div>
        </Field>

        <Field id="field-commune" label="البلدية" error={errors.commune}>
          <div className={cn(styles.control, errors.commune && styles.invalid)}>
            <Building2 className={styles.icon} strokeWidth={1.5} />
            <select
              id="field-commune"
              value={values.commune}
              disabled={!values.wilaya}
              onChange={(e) => onChange("commune", e.target.value)}
              className={cn(!values.commune && styles.empty)}
            >
              <option value="">{values.wilaya ? "اختر البلدية" : "اختاري الولاية أولاً"}</option>
              {communeOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className={styles.chevron} size={18} strokeWidth={1.8} />
          </div>
        </Field>

        <Field id="field-phone" label="رقم الهاتف" error={errors.phone}>
          <div className={styles.phone}>
            <div className={cn(styles.control, styles.phoneInput, errors.phone && styles.invalid)}>
              <Phone className={styles.icon} strokeWidth={1.5} />
              <input
                id="field-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="05 50 12 34 56"
                value={formatPhone(values.phone)}
                onChange={(e) => onChange("phone", digitsOnly(e.target.value).slice(0, 10))}
              />
            </div>
            <div className={cn(styles.prefix, "ltr")}>
              <span>+213</span>
              <AlgerianFlag />
            </div>
          </div>
        </Field>
      </div>
    </section>
  );
}
