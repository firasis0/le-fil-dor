import { useRef, useState } from "react";
import { CloudUpload, ImageIcon, Pencil, Trash2, X } from "lucide-react";
import SectionHeading from "../section-heading";
import { cn } from "../../../lib/utils";
import styles from "./styles.module.scss";

// Step 1: choose the caftan photo (click or drag and drop) and show its preview
export default function ModelUploader({ image, onChoose, onRemove, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Open the file picker
  const openPicker = () => inputRef.current?.click();

  // Take the first chosen file and hand it to the form
  function handleFiles(files) {
    onChoose(files?.[0]);
    if (inputRef.current) inputRef.current.value = ""; // allows picking the same file again
  }

  // Photo dropped on the box
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <section className={styles.card} aria-labelledby="step-photo">
      <SectionHeading
        number="01"
        id="step-photo"
        title="صورة الموديل"
        subtitle="ارفعي صورة القفطان الذي ترغبين في تفصيله"
        icon={<ImageIcon />}
      />

      <div className={styles.body}>
        {image && (
          <>
            <div className={styles.tools}>
              <button type="button" className={styles.tool} onClick={openPicker} aria-label="تغيير الصورة">
                <Pencil size={18} strokeWidth={1.7} />
              </button>
              <button type="button" className={styles.tool} onClick={onRemove} aria-label="حذف الصورة">
                <Trash2 size={18} strokeWidth={1.7} />
              </button>
            </div>

            <div className={styles.preview}>
              <img src={image.dataUrl} alt="صورة القفطان المختار" />
              <button type="button" className={styles.remove} onClick={onRemove} aria-label="إزالة الصورة">
                <X size={13} strokeWidth={3} />
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          className={cn(styles.drop, dragging && styles.dragging, error && styles.hasError)}
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <CloudUpload className={styles.dropIcon} strokeWidth={1.4} />
          <span className={styles.dropTitle}>اضغطي لرفع الصورة</span>
          <span className={cn(styles.dropHint, "ltr")}>JPG, PNG, WEBP (<bdi>حتى</bdi> <bdi>10MB</bdi>)</span>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
