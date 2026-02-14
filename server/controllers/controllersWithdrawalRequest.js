const fs = require("fs");
const path = require("path");
const WithdrawalRequestService = require("../services/servicesWithdrawalRequest");

const watcherPath = path.join(
  __dirname,
  "../services/currentWatcherUser.json"
);

class WithdrawalRequestController {
  static getLoggedUser() {
    if (!fs.existsSync(watcherPath)) return null;
    const raw = fs.readFileSync(watcherPath);
    const parsed = JSON.parse(raw);
    return parsed.userId;
  }

  static async create(req, res) {
    try {
      const loggedUser = WithdrawalRequestController.getLoggedUser();

      if (!loggedUser) {
        return res.status(401).json({
          success: false,
          message: "No logged user found"
        });
      }

      // Inject the loggedUser ID into the request body
      const bodyWithUser = {
        ...req.body,
        userId: loggedUser // ✅ Add the logged-in user automatically
      };

      // Save EXACT body with userId
      const saved = await WithdrawalRequestService.create(bodyWithUser);

      return res.status(201).json(saved);

    } catch (error) {
      console.error("Withdrawal Error:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = WithdrawalRequestController;
