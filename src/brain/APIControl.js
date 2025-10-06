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
  async login(email, password) {
  try {
    email = email.trim();
    password = password.trim();

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      localStorage.removeItem("authToken");
      return { success: false, error: data.error || "Invalid email or password" };
    }

    localStorage.setItem("authToken", data.token);
    return { success: true, data: data.data, token: data.token };
  } catch (error) {
    localStorage.removeItem("authToken");
    return { success: false, error: "Login failed" };
  }
},



async loginUser(email, password) {
  return this.login(email, password);
},
/**
 * Real API signup
 */
async signup(signupData) {
  try {
    // Flatten the object correctly
    const { firstName, middleName, email, phone, password, confirmPassword, agreeTerms } = signupData;

    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, middleName, email, phone, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Signup failed" };
    }

    return { success: true, data: data.data };
  } catch (err) {
    return { success: false, error: "Signup failed" };
  }
},
  /**
   * Real API logout (if applicable)
   */
  async logout() {
    try {
      // If backend logout API exists, call it here; else just resolve immediately
      const response = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: {
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
      }
    });

    if (!response.ok) {
      return { success: false, error: "Failed to fetch user info" };
    }

    const data = await response.json();
return { success: true, data: data.data }; // Only the user object

  } catch (error) {
    return { success: false, error: "Failed to fetch user info" };
  }
},


  /**
   * Fetch real trades data from backend
   */
  async fetchTrades() {
    try {
      const response = await fetch(`${BASE_URL}/api/trades`, {
        headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
 * Fetch the single MT account
 */
async fetchMTAccount() {
  try {
    const response = await fetch(`${BASE_URL}/api/mtaccounts`, {
      headers: {
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
      }
    });

    if (!response.ok) return { success: false, data: null };

    const data = await response.json();
    return { success: true, data: data.data || null }; // single account
  } catch (err) {
    console.error("Error fetching MT account:", err);
    return { success: false, data: null };
  }
},

/**
 * Connect MT account
 */
async connectMTAccount({ broker, login, password, server, platform, accountType }) {
  try {
    const response = await fetch(`${BASE_URL}/api/mtaccounts/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
      },
      body: JSON.stringify({ broker, login, password, server, platform, accountType }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to connect MT account" };
    }

    // Correctly pick currency from returned account
    return {
      success: data.success,
      message: data.message,
      currency: data.account?.currency || null
    };
  } catch (err) {
    console.error("Error connecting MT account:", err);
    return { success: false, message: "Unexpected error" };
  }
},

/**
 * Delete MT account
 */
async deleteMTAccount() {
  try {
    const response = await fetch(`${BASE_URL}/api/mtaccounts`, { // assume DELETE /api/mtaccounts
      method: "DELETE",
      headers: {
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.message || "Failed to delete account" };
    }

    const data = await response.json();
    return { success: true, message: data.message || "MT account deleted successfully" };
  } catch (err) {
    console.error("Error deleting MT account:", err);
    return { success: false, message: "Unexpected error" };
  }
},


  /**
 * Fetch PropFirm accounts data from backend safely
 */
async fetchPropFirmAccountsData() {
  try {
    const response = await fetch(`${BASE_URL}/api/propfirmaccounts`, {
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
/**
 * Fetch all Forex pair strengths
 */
async fetchMarketStrength() {
  try {
    const response = await fetch(`${BASE_URL}/api/brain/strength`, {
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
    const response = await fetch(`${BASE_URL}/api/brain/choch`, {
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

    });
    if (!response.ok) return { success: false, data: [] };
    const data = await response.json();
    // data is already the array from backend
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error("Error fetching CHoCH data:", err);
    return { success: false, data: [] };
  }
},


/**
 * Fetch next command for MT account
 */
async fetchNextCommand(account) {
  try {
    const response = await fetch(`${BASE_URL}/command?account=${account}`, {
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
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
      const response = await fetch(`${BASE_URL}/api/trades?tab=${encodeURIComponent(tab)}`, {
        headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
        headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

    });

    if (!response.ok) {
      return { success: false, data: null, error: "Failed to fetch Binance data" };
    }

    const data = await response.json();
    // Ensure structure: { account: {...}, public: {...} }
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching Binance data:", error);
    return { success: false, data: null, error: error.message || "Failed to fetch Binance data" };
  }
},

async connectBinance(apiKey, apiSecret) {
  try {
    console.log("Frontend token:", localStorage.getItem("authToken"));
    const response = await fetch(`${BASE_URL}/api/binance/connect`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({ apiKey, apiSecret }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Failed to connect Binance" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error connecting Binance:", err);
    return { success: false, error: "Failed to connect Binance" };
  }
},

async refreshBinance() {
  try {
    const response = await fetch(`${BASE_URL}/api/binance/refresh`, {
      method: "POST",
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

    });

    if (!response.ok) {
      return { success: false, error: "Failed to refresh Binance" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error refreshing Binance:", err);
    return { success: false, error: err.message || "Failed to refresh Binance" };
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
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
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
 * Fetch the strongest Forex pair
 */
async fetchStrongestPair() {
  try {
    const response = await fetch(`${BASE_URL}/api/brain/strongest`, {
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

    });
    if (!response.ok) return { success: false, data: null };
    const data = await response.json();
    return data.success ? { success: true, data: data.data } : { success: false, data: null };
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
        headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
  this.fetchMTAccount(),       // <- updated function
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
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
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
      headers: {
  ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
}

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
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
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
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
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


};


export default APIControl;
