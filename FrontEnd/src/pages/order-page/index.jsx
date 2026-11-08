import Decorations from "../../components/Main/decorations";
import Header from "../../components/Main/header";
import ModelUploader from "../../components/Main/model-uploader";
import MeasurementSection from "../../components/Main/measurement-section";
import PersonalInformation from "../../components/Main/personal-information";
import OrderSubmit from "../../components/Main/order-submit";
import OrderSuccessPopup from "../../components/Main/order-success-popup";
import Footer from "../../components/Main/footer";
import useOrderForm from "../../hooks/useOrderForm";
import styles from "./styles.module.scss";

// Which element to bring into view for each kind of error.
const targetFor = (key) =>
  ({
    image: "step-photo",
    sleeves: "m-sleeves",
    chest: "m-chest",
    hips: "m-hips",
    length: "m-length",
  })[key] ?? `field-${key}`;

// The customer page: photo + measurements + personal info, then send.
export default function OrderPage() {
  const form = useOrderForm();

  // Send the form; if something is wrong, scroll to the first problem
  async function handleSubmit(e) {
    e.preventDefault();
    const result = await form.submit();
    if (result.firstError) {
      const el =
        document.getElementById(targetFor(result.firstError)) ?? document.getElementById("step-measures");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus?.({ preventScroll: true });
    }
  }

  return (
    <div className={styles.page}>
      <Decorations />

      <main className={styles.column}>
        <Header />

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <ModelUploader
            image={form.image}
            onChoose={form.chooseImage}
            onRemove={form.removeImage}
            error={form.errors.image}
          />
          <MeasurementSection
            values={form.measurements}
            errors={form.errors}
            onChange={form.setMeasurement}
          />
          <PersonalInformation values={form.customer} errors={form.errors} onChange={form.setCustomerField} />
          <OrderSubmit status={form.status} failMessage={form.failMessage} />
        </form>
      </main>

      <Footer />

      {/* thank-you popup: closes by itself, then the form is emptied */}
      {form.status === "done" && <OrderSuccessPopup orderNumber={form.orderNumber} onClose={form.reset} />}
    </div>
  );
}
