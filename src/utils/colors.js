export const toColor = (p) => {
  if (p <= 40) return "🟥";
  if (p <= 70) return "🟧";
  return "🟩";
};
