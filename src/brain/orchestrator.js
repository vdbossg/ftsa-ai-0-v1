// Runs the brain modules on schedule
import { updateStrength } from "./marketStrength";
import { updateNews } from "./newsPulse";

export function startBrain() {
  console.log("FTSA AI Brain orchestrator starting...");
  // Strength update every 5 min
  setInterval(updateStrength, 5 * 60 * 1000);
  // News update every 1 min
  setInterval(updateNews, 60 * 1000);
}
