// server/services/mtConnector.js
// Handles backend logic to connect to MT4/MT5 servers


const MTConnector = {
 clients: {}, // store active MT clients by accountId
   
  /**
   * Connect to MT4/MT5 server
   * @param {string} accountId
   * @param {string} password
   * @param {string} server
   * @returns {Promise<object>}
   */
  async connect(accountId, password, server) {
    try {
      if (!accountId || !password || !server) {
        throw new Error("Missing accountId, password, or server");
      }

const mtClient = new MTApi({ accountId, password, server }); // ← real MT connection
await mtClient.connect();                                   // ← actually connect
this.clients[accountId] = mtClient;                        // ← store client

return {
  success: true,
  accountId,
  server,
  message: "Connected successfully to MT server",
};

    } catch (error) {
      return { success: false, error: error.message || "Failed to connect to MT server" };
    }
  },

  /**
   * Disconnect from MT server (optional)
   */
  async disconnect(accountId) {
    try {
      const mtClient = this.clients[accountId];
  if (mtClient) {
  await mtClient.disconnect(); // ← real disconnect
  delete this.clients[accountId];
}


return {
  success: true,
  accountId,
  message: "Disconnected from MT server",
};

    } catch (error) {
      return { success: false, error: error.message || "Failed to disconnect" };
    }
  },
};

module.exports = MTConnector;
