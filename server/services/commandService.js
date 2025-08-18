const strengthService = require("./strengthService");
const chochService = require("./chochService");

// In-memory store for commands per account (can move to DB later)
let accountCommands = {};

/**
 * Get command for a specific account
 * Brain decides which pair to trade, direction, risk %, grid, etc.
 */
exports.getCommandForAccount = async (account) => {
  // 1️⃣ Check if account already has a command today
  const today = new Date().toISOString().split("T")[0];
  if (accountCommands[account]?.date === today) {
    return accountCommands[account].command;
  }

  // 2️⃣ Get strongest pair
  const strongest = await strengthService.getStrongestPair();
  if (!strongest) {
    return { allow: false, reason: "No data" };
  }

  const { symbol, percent } = strongest;

  // 3️⃣ Check LTF CHoCH for valid direction
  const choch = await chochService.getLTF(symbol); // returns { side: "bull"/"bear", valid: true/false }
  if (!choch?.valid) {
    return { allow: false, reason: "LTF CHoCH not valid" };
  }

  // 4️⃣ Decide side based on CHoCH
  const side = choch.side === "bull" ? "buy" : "sell";

  // 5️⃣ Create command object
  const command = {
    allow: true,
    symbol,
    side,
    reason: { percent, choch: choch.side },
    riskPct: 1.5,          // could be dynamic per user
    grid: { enabled: true },
    closeAll: false,
  };

  // 6️⃣ Store command for today
  accountCommands[account] = {
    date: today,
    command
  };

  return command;
};
