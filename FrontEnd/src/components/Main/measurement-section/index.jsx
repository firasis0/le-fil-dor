import { useState } from "react";
import SectionHeading from "../section-heading";
import CaftanIllustration from "../caftan-illustration";
import MeasurementInput from "../measurement-input";
import MeasurementMarker from "../measurement-marker";
import MeasurementBottomSheet from "../measurement-bottom-sheet";
import { TapeIcon } from "../measurement-input/icons";
import useMediaQuery from "../../../hooks/useMediaQuery";
import { MEASUREMENTS, getLayout, getMeasurement } from "../../../lib/measurements";
import styles from "./styles.module.scss";

// Step 2: the caftan illustration with the 4 measurement fields around it
export default function MeasurementSection({ values, errors, onChange }) {
  const compact = useMediaQuery("(max-width: 519px)");
  const [activeKey, setActiveKey] = useState(null); // field being edited → highlights its leader line
  const [sheetKey, setSheetKey] = useState(null); // phone: which measurement the sheet is editing

  const layout = getLayout(compact);
  const { stage, card } = layout;

  const filled = Object.fromEntries(MEASUREMENTS.map((m) => [m.key, values[m.key] !== ""]));
  const problems = MEASUREMENTS.filter((m) => errors[m.key]);
  const sheetDef = sheetKey && getMeasurement(sheetKey);

  return (
    <section className={styles.card} aria-labelledby="step-measures">
      <SectionHeading
        number="02"
        id="step-measures"
        title="قياسات القفطان"
        subtitle="أدخلي القياسات المطلوبة بالسنتيمتر (سم)"
        icon={<TapeIcon />}
      />

      <div className={styles.stage} style={{ aspectRatio: `${stage.width} / ${stage.height}` }}>
        <CaftanIllustration layout={layout} activeKey={compact ? sheetKey : activeKey} filled={filled} />

        {layout.items.map(({ def, card: pos }) => (
          <div
            key={def.key}
            className={styles.slot}
            style={{
              left: `${(pos.x / stage.width) * 100}%`,
              top: `${(pos.y / stage.height) * 100}%`,
              width: `${(card.width / stage.width) * 100}%`,
              height: `${(card.height / stage.height) * 100}%`,
            }}
          >
            {compact ? (
              <MeasurementMarker
                def={def}
                value={values[def.key]}
                onOpen={setSheetKey}
                active={sheetKey === def.key}
                invalid={Boolean(errors[def.key])}
              />
            ) : (
              <MeasurementInput
                def={def}
                value={values[def.key]}
                onChange={onChange}
                onActive={setActiveKey}
                active={activeKey === def.key}
                invalid={Boolean(errors[def.key])}
              />
            )}
          </div>
        ))}
      </div>

      {problems.length > 0 && (
        <ul className={styles.errors} role="alert">
          {problems.map((m) => (
            <li key={m.key}>
              <b>{m.label}</b> — {errors[m.key]}
            </li>
          ))}
        </ul>
      )}

      {compact && sheetDef && (
        <MeasurementBottomSheet
          def={sheetDef}
          value={values[sheetDef.key]}
          onChange={onChange}
          onClose={() => setSheetKey(null)}
        />
      )}
    </section>
  );
}
