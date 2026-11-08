// The four measurements a caftan needs, and where they sit around the illustration.
//
// The artwork is a 428 × 1157 picture of the model. Each measurement has an "anchor":
// a dot already drawn on the artwork (in artwork pixels) where its leader line lands.
// Two layouts place the artwork and the cards: `wide` (tablet / desktop) and `compact` (phones).

export const ARTWORK = { width: 428, height: 1157 };

export const MEASUREMENTS = [
  { key: "sleeves", label: "طول الأكمام", short: "الأكمام", min: 30, max: 80, start: 58 },
  { key: "chest", label: "مقاس الصدر", short: "الصدر", min: 60, max: 160, start: 96 },
  { key: "hips", label: "مقاس الأوراك", short: "الأوراك", min: 70, max: 180, start: 104 },
  { key: "length", label: "طول العباية", short: "الطول", min: 80, max: 190, start: 145 },
];
// start = where the +/- buttons begin when the field is still empty

const ANCHORS = {
  sleeves: { x: 63, y: 318 },
  chest: { x: 291, y: 290 },
  hips: { x: 334, y: 539 },
  length: { x: 154, y: 903 },
};

// side = which edge of the card the leader line leaves from
const LAYOUTS = {
  wide: {
    stage: { width: 848, height: 522 },
    figure: { x: 318, y: 4, height: 500 },
    card: { width: 190, height: 96 },
    cards: {
      sleeves: { x: 40, y: 92, side: "right" },
      chest: { x: 618, y: 100, side: "left" },
      hips: { x: 618, y: 205, side: "left" },
      length: { x: 40, y: 308, side: "right" },
    },
  },
  compact: {
    stage: { width: 420, height: 548 },
    figure: { x: 112, y: 2, height: 530 },
    card: { width: 100, height: 58 },
    cards: {
      sleeves: { x: 0, y: 120, side: "right" },
      chest: { x: 320, y: 106, side: "left" },
      hips: { x: 320, y: 214, side: "left" },
      length: { x: 0, y: 380, side: "right" },
    },
  },
};

// Everything the section and the illustration need, in one stage coordinate system.
export function getLayout(compact) {
  const l = LAYOUTS[compact ? "compact" : "wide"];
  const scale = l.figure.height / ARTWORK.height;
  const figure = { x: l.figure.x, y: l.figure.y, width: ARTWORK.width * scale, height: l.figure.height };

  const items = MEASUREMENTS.map((def) => ({
    def,
    card: l.cards[def.key],
    anchor: {
      x: figure.x + ANCHORS[def.key].x * scale,
      y: figure.y + ANCHORS[def.key].y * scale,
    },
  }));

  return { stage: l.stage, figure, card: l.card, items };
}

// Find a measurement definition by its key
export const getMeasurement = (key) => MEASUREMENTS.find((m) => m.key === key);

// Check one measurement value; returns an Arabic error message, or '' when it is fine
export function validateMeasurement(def, value) {
  if (value === "" || value === null || value === undefined) return "مطلوب";
  const n = Number(value);
  if (Number.isNaN(n)) return "أدخلي رقماً";
  if (n < def.min || n > def.max) return `بين ${def.min} و ${def.max} سم`;
  return "";
}
