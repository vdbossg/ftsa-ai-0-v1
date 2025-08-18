class MTAccount {
  constructor(data) { this.accountId = data.accountId; this.server = data.server; }
  static async find() { return []; }
  static async findById(id) { return null; }
  async save() { return this; }
}
module.exports = MTAccount;
