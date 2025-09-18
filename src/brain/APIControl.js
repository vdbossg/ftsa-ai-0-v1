// /src/brain/APIControl.js
// Handles API communication between EA/Backend and React App
// Phase 4 & 5: Mock API with loading/error simulation and basic authentication

// Remove delay and mockData usage from API calls, keep delay function for any UI loading usage if needed
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Base URL of your backend API — change this to your actual backend URL
const BASE_URL = "http://localhost:5000";


const APIControl = {
  /**
   * Real API login
   */
  async login(username, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || "Invalid username or password" };
      }

      const data = await response.json();
      // Expecting backend returns something like { token, user }
      return { success: true, data: data.user, token: data.token };
    } catch (error) {
      return { success: false, error: "Login failed" };
    }
  },
async loginUser(username, password) {
  return this.login(username, password);
},

  /**
   * Real API logout (if applicable)
   */
  async logout() {
    try {
      // If backend logout API exists, call it here; else just resolve immediately
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        return { success: false, error: "Logout failed" };
      }

      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      return { success: false, error: "Logout failed" };
    }
  },

  /**
   * Fetch real user info from backend
   */
  async fetchUserInfo() {
    try {
      const response = await fetch(`${BASE_URL}/api/user/info`, {
  headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
});

      if (!response.ok) {
        return { success: false, error: "Failed to fetch user info" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: "Failed to fetch user info" };
    }
  },

  /**
   * Fetch real trades data from backend
   */
  async fetchTrades() {
    try {
      const response = await fetch(`${BASE_URL}/trades`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch trades" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: "Failed to fetch trades" };
    }
  },

  /**
   * Fetch real news events from backend
   */
  async fetchNews() {
    try {
      const response = await fetch(`${BASE_URL}/news`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch news" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: "Failed to fetch news" };
    }
  },

  /**
 * Fetch MT accounts data from backend safely
 */
async fetchMTAccountsData() {
  try {
    const response = await fetch(`${BASE_URL}/api/mtaccounts`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) {
      console.error("Failed to fetch MT accounts data:", response.statusText);
      return { success: false, data: [] };
    }

    const data = await response.json();
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (error) {
    console.error("Error fetching MT accounts data:", error);
    return { success: false, data: [] };
  }
},


  /**
 * Fetch PropFirm accounts data from backend safely
 */
async fetchPropFirmAccountsData() {
  try {
    const response = await fetch(`${BASE_URL}/api/propfirmaccounts`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) {
      // Return empty array instead of error object to avoid breaking components
      console.error("Failed to fetch PropFirm accounts data:", response.statusText);
      return { success: false, data: [] };
    }

    const data = await response.json();
    // Ensure we always return an array
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (error) {
    console.error("Error fetching PropFirm accounts data:", error);
    return { success: false, data: [] };
  }
},
/**
 * Fetch current currency strength from backend
 */
async fetchMarketStrength() {
  try {
    const response = await fetch(`${BASE_URL}/api/brain/strength`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) return { success: false, data: [] };
    const data = await response.json();
    return data.success ? { success: true, data: data.data } : { success: false, data: [] };
  } catch (err) {
    console.error("Error fetching market strength:", err);
    return { success: false, data: [] };
  }
},

/**
 * Fetch current CHoCH direction from backend
 */
async fetchChochData() {
  try {
    const response = await fetch(`${BASE_URL}/choch`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) return { success: false, data: {} };
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error fetching CHoCH data:", err);
    return { success: false, data: {} };
  }
},

/**
 * Fetch next command for MT account
 */
async fetchNextCommand(account) {
  try {
    const response = await fetch(`${BASE_URL}/command?account=${account}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) return { success: false, data: null };
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error fetching next command:", err);
    return { success: false, data: null };
  }
},
async sendTVSignal(symbol, percent, timeframe, direction) {
  try {
    await fetch(`${BASE_URL}/tv-webhook`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ symbol, percent, timeframe, direction })
    });
    return { success: true };
  } catch (err) {
    return { success: false };
  }
},

/**
 * Real API login for PropFirm account
 */
async propFirmLogin(accountID, password, serverName) {
  try {
    const response = await fetch(`${BASE_URL}/api/propfirmaccounts/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountID, password, serverName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Failed to connect PropFirm account" };
    }

    const data = await response.json();
    // Returns the connected account info
    return { success: true, data: data.account, message: data.message };
  } catch (error) {
    return { success: false, error: "PropFirm login failed" };
  }
},


  /**
   * Fetch trades data by tab from backend
   */
  async fetchTradesData(tab) {
    try {
      const response = await fetch(`${BASE_URL}/trades?tab=${encodeURIComponent(tab)}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch trades data" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: "Failed to fetch trades data" };
    }
  },

  /**
   * Fetch journal data from backend
   */
  async fetchJournalData(accountType, filters) {
    try {
      // Compose query params based on filters and accountType
      const params = new URLSearchParams({ accountType, ...filters }).toString();

      const response = await fetch(`${BASE_URL}/journal?${params}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        return { success: false, error: "Failed to fetch journal data" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: "Failed to fetch journal data" };
    }
  },
  async fetchBinanceData() {
  try {
    const response = await fetch(`${BASE_URL}/api/binance`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) {
      return { success: false, data: null };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching Binance data:", error);
    return { success: false, data: null };
  }
},
async connectBinance(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/binance/connect`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) return { success: false, error: "Failed to connect Binance" };
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Failed to connect Binance" };
  }
},
async refreshBinance(token) {
  try {
    const response = await fetch(`${BASE_URL}/api/binance/refresh`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!response.ok) return { success: false, error: "Failed to refresh Binance" };
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Failed to refresh Binance" };
  }
},


    /**
   * Send equity report to backend
   */
  async sendEquityReport(account, balance, equity) {
    try {
      const response = await fetch(`${BASE_URL}/equity-report`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ account, balance, equity }),
      });

      if (!response.ok) {
        return { success: false, error: "Failed to send equity report" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: "Equity report failed" };
    }
  },

  /**
   * Fetch strongest currency pair from backend
   */
  async fetchStrongestPair() {
    try {
      const response = await fetch(`${BASE_URL}/strongest-pair`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) return { success: false, data: null };

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching strongest pair:", err);
      return { success: false, data: null };
    }
  },

  /**
   * Fetch AI Brain dashboard data
   */
  async fetchBrainDashboard() {
    try {
      const response = await fetch(`${BASE_URL}/dashboard`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) return { success: false, data: {} };

      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.error("Error fetching brain dashboard:", err);
      return { success: false, data: {} };
    }
  },

  /**
   * Fetch all dashboard data at once
   */
async fetchDashboardData() {
  try {
    // Fetch all necessary data in parallel
    const [
      userInfoRes,
      tradesRes,
      newsRes,
      mtAccountsRes,
      propAccountsRes,
      marketStrengthRes,
      brainDashboardRes
    ] = await Promise.all([
      this.fetchUserInfo(),
      this.fetchTrades(),
      this.fetchNews(),
      this.fetchMTAccountsData(),
      this.fetchPropFirmAccountsData(),
      this.fetchMarketStrength(),
      this.fetchBrainDashboard()
    ]);

    // Combine MT + PropFirm accounts
    const accounts = [
      ...(mtAccountsRes.data || []),
      ...(propAccountsRes.data || [])
    ];

    return {
      success: true,
      data: {
        userInfo: userInfoRes.data || {},
        trades: tradesRes.data || [],
        news: newsRes.data || [],
        accounts,
        tradeAlerts: brainDashboardRes.data.tradeAlerts || [],
        reminders: brainDashboardRes.data.reminders || [],
        marketStrength: marketStrengthRes.data || [],
        autoTradeStatus: brainDashboardRes.data.autoTradeStatus || "Unknown"
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, error: "Failed to fetch dashboard data" };
  }
},  
  /**
   * Fetch all status page data at once
   */
  async fetchStatusData() {
    try {
      const userInfo = await this.fetchUserInfo();
      const trades = await this.fetchTrades();

      return {
        success: true,
        data: {
          userInfo: userInfo.data,
          trades: trades.data,
        },
      };
    } catch (error) {
      return { success: false, error: "Failed to fetch status data" };
    }
  },

  async sendCommand(command, payload = {}) {
  try {
    const response = await fetch(`${BASE_URL}/command`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command, ...payload }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Failed to send command" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error sending command:", error);
    return { success: false, error: "Failed to send command" };
  }
},



  // The following methods remain unchanged and still use delay and mock data:

  /**
   * Simulate fetching settings data
   */
  async fetchSettingsData() {
  try {
    const response = await fetch(`${BASE_URL}/api/settings`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.ok) return { success: false, data: null };

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error fetching settings data:", err);
    return { success: false, data: null };
  }
},


  async saveSettingsData(settings) {
  try {
    const response = await fetch(`${BASE_URL}/api/settings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) return { success: false, error: "Failed to save settings" };

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error saving settings data:", err);
    return { success: false, error: "Failed to save settings" };
  }
},
async toggleAutoTrade(start) {
  try {
    const response = await fetch(`${BASE_URL}/api/auto-trade`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ start }),
    });

    if (!response.ok) return { success: false, error: "Failed to toggle auto-trade" };

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: "Failed to toggle auto-trade" };
  }
},
/**
 * Fetch all Forex pair strengths
 */
async fetchMarketStrength() {
  try {
    const response = await fetch(`${BASE_URL}/api/brain/strength`, { // ✅ correct path
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) return { success: false, data: [] };
    const data = await response.json();
    return data.success ? { success: true, data: data.data } : { success: false, data: [] };
  } catch (err) {
    console.error("Error fetching market strength:", err);
    return { success: false, data: [] };
  }
},

/**
 * Fetch the strongest Forex pair
 */
async fetchStrongestPair() {
  try {
    const response = await fetch(`${BASE_URL}/strength/strongest`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    if (!response.ok) return { success: false, data: null };
    const data = await response.json();
    return data.success ? { success: true, data: data.data } : { success: false, data: null };
  } catch (err) {
    console.error("Error fetching strongest pair:", err);
    return { success: false, data: null };
  }
},

};


export default APIControl;
