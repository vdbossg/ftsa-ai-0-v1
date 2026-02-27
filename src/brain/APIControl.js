// /src/brain/APIControl.js
// Handles API communication between EA/Backend and React App
// Phase 4 & 5: Mock API with loading/error simulation and basic authentication

// Remove delay and mockData usage from API calls, keep delay function for any UI loading usage if needed
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Base URL of your backend API — change this to your actual backend URL
const BASE_URL = "https://ftsa-ai-backend.onrender.com";


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

// ✅ Fix: use message instead of data.data
return { success: true, message: data.message || "Signup successful" };

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
async fetchUserInfo(token = null) {
  try {
    // Use passed token, or fallback to localStorage
    const authToken = token || localStorage.getItem("authToken");
    if (!authToken) return { success: false, error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || "Failed to fetch user info" };
    }

    const data = await response.json();
    return { success: true, data: data.data }; // Only the user object
  } catch (err) {
    console.error("fetchUserInfo error:", err);
    return { success: false, error: "Failed to fetch user info" };
  }
},

/**
 * Fetch active EX5 licenses for logged-in user
 */
async fetchActiveEx5Licenses() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return { success: false, data: [], error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/ea-licenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { success: false, data: [], error: "Failed to fetch licenses" };

    const result = await response.json();
    const active = Array.isArray(result.data) ? result.data.filter(l => l.status === "active") : [];
    return { success: true, data: active };
  } catch (err) {
    console.error("fetchActiveEx5Licenses error:", err);
    return { success: false, data: [], error: err.message || "Unexpected error" };
  }
},


/**
 * Fetch inactive EX5 licenses for logged-in user
 */


async fetchInactiveEx5Licenses() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return { success: false, data: [], error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/ea-licenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return { success: false, data: [], error: "Failed to fetch licenses" };

    const result = await response.json();
    const inactive = Array.isArray(result.data) ? result.data.filter(l => l.status === "inactive") : [];
    return { success: true, data: inactive };
  } catch (err) {
    console.error("fetchInactiveEx5Licenses error:", err);
    return { success: false, data: [], error: err.message || "Unexpected error" };
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
 * Fetch the single MT4 account
 */
async fetchMT4Account() {
  try {
    const response = await fetch(`${BASE_URL}/api/mt4accounts`, {
      headers: {
        ...(localStorage.getItem("authToken") && {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        }),
      },
    });

    if (!response.ok) return { success: false, data: null };

    const data = await response.json();
    return { success: true, data: data.data || null };
  } catch (err) {
    console.error("Error fetching MT4 account:", err);
    return { success: false, data: null };
  }
},
async connectPropFirmAccount({ broker, login, password, server, platform = "MT5", accountType = "demo" }) {
  try {
    const response = await fetch(`${BASE_URL}/api/propaccounts/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
      },
      body: JSON.stringify({ broker, login, password, server, platform, accountType }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, message: data.message || "Failed to connect PropFirm account" };
    }

    return {
      success: true,
      message: data.message,
      account: {
        broker: data.account?.broker || broker,
        login: data.account?.login || login,
        server: data.account?.server || server,
        platform: data.account?.platform || platform,
        accountType: data.account?.accountType || accountType,
        currency: data.account?.currency || "USD"
      }
    };
  } catch (err) {
    console.error("Error connecting PropFirm account:", err);
    return { success: false, message: "Unexpected error" };
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
  account: {
    broker: data.account?.broker || broker,
    login: data.account?.login || login,
    server: data.account?.server || server,
    platform: data.account?.platform || platform,
    accountType: data.account?.accountType || accountType,
    currency: data.account?.currency || null
  }
};

  } catch (err) {
    console.error("Error connecting MT account:", err);
    return { success: false, message: "Unexpected error" };
  }
},
/**
 * Connect MT4 account
 */
async connectMT4Account({ broker, login, password, server, platform, accountType }) {
  try {
    const response = await fetch(`${BASE_URL}/api/mt4accounts/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("authToken") && {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        }),
      },
      body: JSON.stringify({ broker, login, password, server, platform, accountType }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, message: data.message || "Failed to connect MT4 account" };
    }

    return {
      success: data.success,
      message: data.message,
      account: {
        broker: data.account?.broker || broker,
        login: data.account?.login || login,
        server: data.account?.server || server,
        platform: data.account?.platform || "MT4",
        accountType: data.account?.accountType || accountType,
        currency: data.account?.currency || null,
      },
    };
  } catch (err) {
    console.error("Error connecting MT4 account:", err);
    return { success: false, message: "Unexpected error" };
  }
},

/**
 * Fetch user profile photo
 */
async fetchUserPhoto() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: true, data: null };
    }

    const response = await fetch(`${BASE_URL}/api/user/photo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return { success: true, data: null };
    }

    const result = await response.json();

    // ✅ CORRECT DATA ACCESS
    const photoUrl = result?.data?.url
      ? `${BASE_URL}${result.data.url}`
      : null;

    return { success: true, data: photoUrl };
  } catch (err) {
    return { success: true, data: null };
  }
},
/**
 * Upload user profile photo
 */
async uploadUserPhoto(file) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, error: "Unauthorized" };
    }

    const formData = new FormData();
    formData.append("photo", file);

    const response = await fetch(`${BASE_URL}/api/user/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { success: false, error: result.error || "Upload failed" };
    }

    // ✅ CORRECT DATA ACCESS
    const photoUrl = result?.data?.url
      ? `${BASE_URL}${result.data.url}`
      : null;

    return { success: true, data: photoUrl };
  } catch (err) {
    return { success: false, error: "Upload failed" };
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
 * Delete PropFirm account
 */
async deletePropFirmAccount(accountID) {
  try {
    // Delete from BOTH /api/propaccounts and /api/propsetting
    const [res1, res2] = await Promise.all([
      fetch(`${BASE_URL}/api/propaccounts/${accountID}`, {
        method: "DELETE",
        headers: {
          ...(localStorage.getItem("authToken") && { 
            "Authorization": `Bearer ${localStorage.getItem("authToken")}` 
          })
        }
      }),
      fetch(`${BASE_URL}/api/propsetting/${accountID}`, {
        method: "DELETE",
        headers: {
          ...(localStorage.getItem("authToken") && { 
            "Authorization": `Bearer ${localStorage.getItem("authToken")}` 
          })
        }
      }),
    ]);

    if (res1.ok || res2.ok) {
      console.log(`✅ Deleted account ${accountID} from both collections.`);
      return { success: true, message: "Account and settings deleted successfully." };
    } else {
      const msg1 = await res1.text();
      const msg2 = await res2.text();
      console.warn("⚠️ Delete failed:", msg1, msg2);
      return { success: false, message: "Failed to delete one or both records." };
    }

  } catch (err) {
    console.error("❌ Delete error:", err);
    return { success: false, message: err.message || "Unexpected delete error." };
  }
},


/**
 * Delete MT4 account
 */
async deleteMT4Account() {
  try {
    const response = await fetch(`${BASE_URL}/api/mt4accounts`, {
      method: "DELETE",
      headers: {
        ...(localStorage.getItem("authToken") && {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
        }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, message: errorData.message || "Failed to delete MT4 account" };
    }

    const data = await response.json();
    return { success: true, message: data.message || "MT4 account deleted successfully" };
  } catch (err) {
    console.error("Error deleting MT4 account:", err);
    return { success: false, message: "Unexpected error" };
  }
},
  /**
 * Fetch PropFirm accounts data from backend safely
 */
async fetchPropFirmAccountsData() {
  try {
    const response = await fetch(`${BASE_URL}/api/propaccounts`, {

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
    return { success: true, data: Array.isArray(data.accounts) ? data.accounts : [] };
  } catch (error) {
    console.error("Error fetching PropFirm accounts data:", error);
    return { success: false, data: [] };
  }
},
/**
 * Fetch the active EA license for the logged-in user
 */
async getActiveLicense() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, data: null, error: "No auth token found" };
    }

    const response = await fetch(`${BASE_URL}/api/licenses/my`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, data: null, error: errData.error || "Failed to fetch license" };
    }

    const data = await response.json();
    return { success: true, data: data.data || null };
  } catch (err) {
    console.error("Error fetching active license:", err);
    return { success: false, data: null, error: err.message || "Unexpected error" };
  }
},

/**
 * Generate EA automatically for the logged-in user and get download URL
 */
async generateAndDownloadEA() {
  try {
    // Step 1: Fetch active license
    const licenseRes = await this.getActiveLicense();

    const license =
      licenseRes.data?.licenseKey ||
      licenseRes.data?.license_key;

    if (!licenseRes.success || !license) {
      return { success: false, error: "No active license found" };
    }

    // Step 2: Generate EA
    const generateRes = await this.generateEA(license);
    if (!generateRes.success || !generateRes.filename) {
      return { success: false, error: generateRes.error || "EA generation failed" };
    }

    // Step 3: Prepare download URL
    const downloadUrl = this.downloadEA(generateRes.filename);

    return { success: true, downloadUrl, filename: generateRes.filename };
  } catch (err) {
    console.error("Error in generateAndDownloadEA:", err);
    return { success: false, error: "Unexpected error generating EA" };
  }
},
/**
 * Download EX5 file by licenseId
 */
async downloadEx5ByLicense(licenseKey) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token");

    const response = await fetch(`${BASE_URL}/api/ea-download/${licenseKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`EX5 download failed: ${errorText}`);
    }

    const blob = await response.blob();
    return blob;
  } catch (err) {
    console.error("downloadEx5ByLicense error:", err);
    throw err;
  }
},

/**
 * Fetch Selar subscription or payment info
 */
async fetchSelarData() {
  try {
    const response = await fetch(`${BASE_URL}/api/selar`, {
      headers: {
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }),
      },
    });
    if (!response.ok) return { success: false, data: [] };
    const data = await response.json();
    return { success: true, data: Array.isArray(data.data) ? data.data : [] };
  } catch (err) {
    console.error("Error fetching Selar data:", err);
    return { success: false, data: [] };
  }
},
/**
 * Fetch CFA data
 */
async fetchCFAData() {
  try {
    const response = await fetch(`${BASE_URL}/api/cfa`, {
      headers: {
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }),
      },
    });
    if (!response.ok) return { success: false, data: [] };
    const data = await response.json();
    return { success: true, data: Array.isArray(data.data) ? data.data : [] };
  } catch (err) {
    console.error("Error fetching CFA data:", err);
    return { success: false, data: [] };
  }
},

/**
 * Fetch OCB data
 */
//async fetchOCBData() {
  //try {
    //const response = await fetch(`${BASE_URL}/api/ocb`, {
      //headers: {
        //...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }),
      //},
    //});
    //if (!response.ok) return { success: false, data: [] };
    //const data = await response.json();
    //return { success: true, data: Array.isArray(data.data) ? data.data : [] };
  //} catch (err) {
    //console.error("Error fetching OCB data:", err);
    //return { success: false, data: [] };
  //}
//},


/**
 * Generate the EA file for a given license
 */
async generateEA(licenseKey) {
  try {
    const response = await fetch(`${BASE_URL}/api/ea/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }),
      },
      body: JSON.stringify({ licenseKey }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "EA generation failed" };
    }

    const data = await response.json();
    return { success: true, filename: data.filename }; // returned filename to download
  } catch (err) {
    console.error("Error generating EA:", err);
    return { success: false, error: "EA generation error" };
  }
},
/**
 * Get download URL for EA
 */
downloadEA(filename) {
  return `${BASE_URL}/api/ea/download/${filename}`;
},

/**
 * Fetch unified PropTrades table data
 */
async fetchPropTableTrades() {
  try {
    const response = await fetch(`${BASE_URL}/api/proptabletrades`, {
      headers: {
        ...(localStorage.getItem("authToken") && { 
          "Authorization": `Bearer ${localStorage.getItem("authToken")}` 
        })
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch PropTrades table:", response.statusText);
      return { success: false, data: [] };
    }

    const data = await response.json();
    return { success: true, data: Array.isArray(data.data) ? data.data : [] };
  } catch (err) {
    console.error("Error fetching PropTrades table:", err);
    return { success: false, data: [] };
  }
},
/**
 * Fetch MTAccounts Trades Table
 */
async fetchMTTableTrades() {
  try {
    const response = await fetch(`${BASE_URL}/api/mttabletrades`, {
      headers: {
        ...(localStorage.getItem("authToken") && { 
          "Authorization": `Bearer ${localStorage.getItem("authToken")}` 
        })
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch MT table trades:", response.statusText);
      return { success: false, data: null };
    }

    const data = await response.json();
    // Return the full object exactly as your backend returns it
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error("Error fetching MT table trades:", err);
    return { success: false, data: null };
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
 * Save RMS settings
 */
async saveRmsSettings(settings) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return { success: false, error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/rms`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || "Failed to save RMS settings" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error saving RMS settings:", err);
    return { success: false, error: err.message || "Unexpected error" };
  }
},

async fetchRmsSettings() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, data: null, error: "No auth token" };
    }

    const response = await fetch(`${BASE_URL}/api/rms`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        data: null,
        error: errData.error || "Failed to fetch RMS settings"
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data || null
    };

  } catch (err) {
    console.error("Error fetching RMS settings:", err);
    return {
      success: false,
      data: null,
      error: err.message
    };
  }
},
/**
 * Fetch filtered signals for the new Brain table
 */
async fetchFilteredSignals() {
  try {
    const response = await fetch(`${BASE_URL}/api/finalTvsignals`, {
      headers: {
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
      }
    });

    if (!response.ok) return { success: false, data: [] };

    const json = await response.json();

    // The API returns { message, data }, so we return data
    return { success: true, data: Array.isArray(json.data) ? json.data : [] };
  } catch (err) {
    console.error("Error fetching filtered signals:", err);
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

async fetchAffiliate(userId) {
  try {
    if (!userId) return { success: false, error: "No user ID" };

    const token = localStorage.getItem("token"); // get the auth token
    if (!token) return { success: false, error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/affiliate/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ include token
      },
    });

    if (!response.ok) {
      if (response.status === 404) return { success: false, data: null };
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || "Failed to fetch affiliate data" };
    }

    const data = await response.json();
    return { success: true, data: data || null };
  } catch (err) {
    console.error("fetchAffiliate error:", err);
    return { success: false, error: err.message || "Unexpected error" };
  }
},

async registerAffiliate(formData) {
  try {
    const token = localStorage.getItem("token"); // get the auth token
    if (!token) return { success: false, error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/affiliate/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ include token
        // DO NOT set Content-Type — browser handles it with FormData
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || "Failed to register affiliate" };
    }

    return { success: true, data: result.data };
  } catch (err) {
    console.error("registerAffiliate error:", err);
    return { success: false, error: err.message || "Unexpected error" };
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
  async fetchPropAIJournal(filters) {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${BASE_URL}/api/propaijournal?${params}`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
  });
  return response.ok ? await response.json() : [];
},

async fetchMTAIJournal(filters) {
  const params = new URLSearchParams(filters).toString();
  const response = await fetch(`${BASE_URL}/api/mtaijournal?${params}`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
  });
  return response.ok ? await response.json() : [];
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
 * Fetch news from backend
 */
// src/brain/APIControl.js
async fetchNews() {
  try {
    const response = await fetch(`${BASE_URL}/api/news/today`, {  // add /today
      headers: {
        ...(localStorage.getItem("authToken") && { "Authorization": `Bearer ${localStorage.getItem("authToken")}` })
      }
    });

    if (!response.ok) return { success: false, data: [] };

    const data = await response.json();
    return { success: true, data: Array.isArray(data.data) ? data.data : [] };
  } catch (err) {
    console.error("Error fetching news:", err);
    return { success: false, data: [] };
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
async saveProfileData(formData, token) {
  try {
    const response = await fetch(`${BASE_URL}/api/user/profile`, { // <- correct route
      method: "PUT",
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` }),
        // DO NOT set Content-Type when sending FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || "Failed to save profile" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error saving profile:", err);
    return { success: false, error: err.message || "Unexpected error" };
  }
},
/**
 * Execute trade from AI Brain
 */
async executeTrade({ pair, risk, dailyMaxLoss, tpTargets }) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { success: false, error: "No auth token" };
    }

    const response = await fetch(`${BASE_URL}/api/brain/execute-trade`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pair,
        risk,
        dailyMaxLoss,
        tpTargets,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.message || "Trade execution failed" };
    }

    const data = await response.json();
    return { success: true, data };

  } catch (err) {
    console.error("executeTrade error:", err);
    return { success: false, error: "Unexpected executeTrade error" };
  }
},


async fetchSettingsData(token) {
  try {
    if (!token) return { success: false, data: null, error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/settings`, {
      headers: {
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, data: null, error: errData.error || "Failed to fetch settings" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error fetching settings data:", err);
    return { success: false, data: null, error: err.message || "Unexpected error" };
  }
},
/**
 * Send password reset email
 * @param {string} email
 */
async forgotPassword(email) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Failed to send reset email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Forgot password error:", err);
    return { success: false, error: err.message || "Something went wrong" };
  }
},
/**
 * Reset password with token
 * @param {string} token - token from reset email link
 * @param {string} newPassword - new password
 */
async resetPassword(token, newPassword) {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Failed to reset password" };
    }

    return { success: true };
  } catch (err) {
    console.error("Reset password error:", err);
    return { success: false, error: err.message || "Something went wrong" };
  }
},

async saveSettingsData(settings) {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) return { success: false, error: "No auth token" };

    const response = await fetch(`${BASE_URL}/api/settings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || "Failed to save settings" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("Error saving settings data:", err);
    return { success: false, error: err.message || "Unexpected error" };
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

/**
 * Unified connect handler for MT4 / MT5
 */
async connectAccount({ broker, login, password, server, platform, accountType }) {
  if (platform === "MT4") {
    return this.connectMT4Account({ broker, login, password, server, platform, accountType });
  } else {
    return this.connectMTAccount({ broker, login, password, server, platform, accountType });
  }
},

/**
 * Unified fetch handler for MT4 / MT5
 */
async fetchAccount(platform) {
  return platform === "MT4"
    ? this.fetchMT4Account()
    : this.fetchMTAccount();
},

/**
 * Unified delete handler for MT4 / MT5
 */
async deleteAccount(platform) {
  return platform === "MT4"
    ? this.deleteMT4Account()
    : this.deleteMTAccount();
},
/**
 * Gateman: Generate JSON for logged-in user
 * @param {string} email - user's email
 */
async gatemanLogin(email) {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`${BASE_URL}/api/gateman/my`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.message || "Failed to generate Gateman JSON" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("gatemanLogin error:", err);
    return { success: false, error: err.message || "Unexpected Gateman error" };
  }
},

/**
 * Gateman: Delete JSON on logout
 */
async gatemanDelete() {
  try {
    const response = await fetch(`${BASE_URL}/api/gateman/my`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.message || "Failed to delete Gateman JSON" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.error("gatemanDelete error:", err);
    return { success: false, error: err.message || "Unexpected Gateman delete error" };
  }
},



async createSupportTicket(ticket) {
  try {
    const response = await fetch(`${BASE_URL}/api/supportticket/Ftsa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("createSupportTicket error:", err);
    return { success: false, message: "Failed to create ticket" };
  }
},
};

export default APIControl;
