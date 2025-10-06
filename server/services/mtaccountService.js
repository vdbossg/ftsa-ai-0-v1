const MTAccountModel = require("../models/MTAccountModel");
const MetaTraderAPI = require("../utils/metaTraderAPI");

/**
 * Get single MT account
 */
async function getMTAccount() {
  try {
    const account = await MTAccountModel.findOne({});
    return account || null;
  } catch (err) {
    console.error("Error fetching MT account:", err);
    return null;
  }
}

/**
 * Connect / save MT account
 */
async function connectMTAccount({ broker, login, password, server, platform, accountType }) {
  try {
    const connected = await MetaTraderAPI.connect({ login, password, server });
    if (!connected.success) {
      return { success: false, message: connected.message || "Failed to connect MT account" };
    }

    let account = await MTAccountModel.findOne({});
    if (account) {
      account.broker = broker;
      account.login = login;
      account.password = password;
      account.server = server;
      account.platform = platform;
      account.accountType = accountType;
      account.currency = connected.currency || account.currency;
      await account.save();
    } else {
      account = new MTAccountModel({
        broker,
        login,
        password,
        server,
        platform,
        accountType,
        currency: connected.currency || "",
      });
      await account.save();
    }

    return { success: true, message: "MT account connected successfully", account };
  } catch (err) {
    console.error("Error connecting MT account:", err);
    return { success: false, message: "Unexpected error" };
  }
}

/**
 * Delete MT account
 */
async function deleteMTAccount() {
  try {
    const result = await MTAccountModel.deleteMany({});
    if (result.deletedCount > 0) {
      return { success: true, message: "MT account deleted successfully" };
    }
    return { success: false, message: "No MT account to delete" };
  } catch (err) {
    console.error("Error deleting MT account:", err);
    return { success: false, message: "Unexpected error" };
  }
}

module.exports = {
  getMTAccount,
  connectMTAccount,
  deleteMTAccount,
};
