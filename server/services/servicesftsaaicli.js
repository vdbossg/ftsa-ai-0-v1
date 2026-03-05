const MT5LiveAccount = require("../models/modelsftsaaicli");

class FTSAcliService {

  async updateLiveTrades(data) {

    const { userId, broker, login, summary, trades } = data;

    if (!userId) {
      throw new Error("userId required");
    }

    const result = await MT5LiveAccount.findOneAndUpdate(
      { userId },
      {
        userId,
        broker,
        login,
        summary,
        trades,
        updatedAt: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

    return result;
  }

  async getLiveTrades(userId) {

    if (!userId) {
      throw new Error("userId required");
    }

    const data = await MT5LiveAccount.findOne({ userId });

    return data;
  }

}

module.exports = new FTSAcliService();