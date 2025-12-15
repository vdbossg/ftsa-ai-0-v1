// src/pages/EA_DownloadPage.jsx
import React, { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import NeonButton from "../components/NeonButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

const EADownloadPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState([]);

  // ---------------- MOCK LICENSES FOR TESTING ----------------
  useEffect(() => {
    if (!isAuthenticated) return;

    const mockLicenses = [
      {
        _id: "LIC001",
        status: "active",
        plan: "Basic",
        broker: "TestBroker",
        mtLogin: "123456",
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        licenseKey: "TESTLIC123"
      },
      {
        _id: "LIC002",
        status: "inactive",
        plan: "Plus",
        broker: "OldBroker",
        mtLogin: "654321",
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        licenseKey: "OLDLIC456"
      }
    ];

    setLicenses(mockLicenses);
    setLoading(false);
  }, [isAuthenticated]);

  // ---------------- MOCK EA DOWNLOAD ----------------
  const generateEA = (licenseKey) => {
    const eaContent = `// FTSA AI EA EX5\n// License: ${licenseKey}\n// Generated on ${new Date().toLocaleString()}`;
    const blob = new Blob([eaContent], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `FTSA_EA_${licenseKey}.ex5`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!isAuthenticated) return <div style={styles.notAuth}>Please log in to continue</div>;
  if (loading) return <LoadingSpinner />;

  const activeLicenses = licenses.filter(l => l.status === "active");
  const inactiveLicenses = licenses.filter(l => l.status === "inactive");

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>FTSA-AI EA Download (Test Mode)</h1>
        <StatusBadge status="online" label="FTSA AI Brain Online" />
      </header>

      {/* Active Licenses */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Active EA Licenses</h2>
        {activeLicenses.length === 0 && <p>No active licenses available.</p>}
        <div style={styles.scrollableCards}>
          {activeLicenses.map(lic => (
            <div key={lic._id} style={styles.licenseCard}>
              <StatusBadge status="online" label="Active License" />
              <p><strong>Plan:</strong> {lic.plan}</p>
              <p><strong>Broker:</strong> {lic.broker}</p>
              <p><strong>MT Login:</strong> {lic.mtLogin}</p>
              <p><strong>Start Date:</strong> {new Date(lic.startDate).toLocaleDateString()}</p>
              <p><strong>Expiry Date:</strong> {new Date(lic.endDate).toLocaleDateString()}</p>
              <p><strong>License Key:</strong> {lic.licenseKey}</p>
              <NeonButton onClick={() => generateEA(lic.licenseKey)}>
                Generate & Download EA
              </NeonButton>
            </div>
          ))}
        </div>
      </section>

      {/* Inactive / Historical Licenses */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Inactive / Historical EAs</h2>
        {inactiveLicenses.length === 0 && <p>No historical licenses.</p>}
        <div style={styles.scrollableCards}>
          {inactiveLicenses.map(lic => (
            <div key={lic._id} style={styles.licenseCard}>
              <StatusBadge status="offline" label="Inactive License" />
              <p><strong>Plan:</strong> {lic.plan}</p>
              <p><strong>Broker:</strong> {lic.broker}</p>
              <p><strong>MT Login:</strong> {lic.mtLogin}</p>
              <p><strong>Start Date:</strong> {new Date(lic.startDate).toLocaleDateString()}</p>
              <p><strong>Expiry Date:</strong> {new Date(lic.endDate).toLocaleDateString()}</p>
              <p><strong>License Key:</strong> {lic.licenseKey}</p>
              <NeonButton onClick={() => generateEA(lic.licenseKey)}>
                Re-download EA
              </NeonButton>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>FTSA AI - Test Mode | Copyright © 2025</p>
      </footer>
    </div>
  );
};

// ----- Styles -----
const neonCyan = "#00FFFF";
const darkBg = "#000000";

const styles = {
  page: {
    backgroundColor: darkBg,
    color: neonCyan,
    fontFamily: "'Orbitron', sans-serif",
    minHeight: "100vh",
    padding: "1rem",
  },
  header: {
    borderBottom: `2px solid ${neonCyan}`,
    paddingBottom: "1rem",
    marginBottom: "1rem",
  },
  title: { fontSize: "2rem", margin: 0 },
  section: { marginBottom: "2rem" },
  sectionTitle: { fontSize: "1.5rem", marginBottom: "1rem", textShadow: `0 0 10px ${neonCyan}` },
  scrollableCards: { display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto" },
  licenseCard: {
    backgroundColor: "#111111",
    border: `2px solid ${neonCyan}`,
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: `0 0 10px ${neonCyan}`,
  },
  footer: { borderTop: `2px solid ${neonCyan}`, paddingTop: "1rem", textAlign: "center", marginTop: "2rem" },
  notAuth: { color: "#FF0000", padding: "2rem", fontFamily: "'Orbitron', sans-serif" },
};

export default EADownloadPage;
