// src/pages/EA_DownloadPage.jsx
import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl";
import { useAuth } from "../contexts/AuthContext";

const EADownloadPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [licenses, setLicenses] = useState([]);

  // Fetch licenses
  // ---------------- FAKE LICENSE DATA FOR TEST ----------------
useEffect(() => {
  if (!isAuthenticated) return;

  const fakeLicenses = [
    {
      _id: "TESTLIC123",
      plan: "Basic",
      broker: "TestBroker",
      mtLogin: "123456",
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      status: "active",
      licenseKey: "TESTLIC123",
    },
    {
      _id: "TESTLIC456",
      plan: "Plus",
      broker: "DemoBroker",
      mtLogin: "654321",
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      status: "inactive",
      licenseKey: "TESTLIC456",
    },
  ];

  setLicenses(fakeLicenses);
  setLoading(false);
}, [isAuthenticated]);


  // Generate EA
  const generateEA = async (licenseKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await APIControl.generateAndDownloadEA(licenseKey);
      if (!res.success) {
        setError(res.error || "EA generation failed");
      } else {
        const link = document.createElement("a");
        link.href = res.downloadUrl;
        link.download = res.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch {
      setError("EA generation error");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <div style={styles.notAuth}>Please log in to continue</div>;
  if (loading) return <LoadingSpinner />;

  // Categorize licenses
  const activeLicenses = licenses.filter(l => l.status === "active");
  const pendingLicenses = licenses.filter(l => l.status === "pending");
  const inactiveLicenses = licenses.filter(l => l.status === "inactive");

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>FTSA-AI EA-DOWNLOAD</h1>
        <StatusBadge status="online" label="FTSA AI Brain Online" />
      </header>

      {/* Top status cards */}
      <div style={styles.statusCards}>
        <div style={styles.statusCard}><strong>Pending:</strong> {pendingLicenses.length}</div>
        <div style={styles.statusCard}><strong>Active:</strong> {activeLicenses.length}</div>
        <div style={styles.statusCard}><strong>Inactive:</strong> {inactiveLicenses.length}</div>
      </div>

      {/* Active EA Licenses */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Active EA Licenses</h2>
        {activeLicenses.length === 0 && <p>No active licenses available.</p>}
        <div style={styles.scrollableCards}>
          {activeLicenses.map(lic => (
            <div key={lic._id} style={styles.licenseCard}>
              <StatusBadge status="online" label="Active License" />
              <p><strong>Plan:</strong> {lic.plan}</p>
              <p><strong>Broker:</strong> {lic.broker}</p>
              <p><strong>MT Login:</strong> {lic.mtLogin || lic.login}</p>
              <p><strong>Start Date:</strong> {new Date(lic.startDate).toLocaleDateString()}</p>
              <p><strong>Expiry Date:</strong> {new Date(lic.endDate).toLocaleDateString()}</p>
              <p><strong>License Key:</strong> {lic.licenseKey || lic.license_key}</p>
              <NeonButton onClick={() => generateEA(lic.licenseKey || lic.license_key)}>
                Generate & Download EA
              </NeonButton>
            </div>
          ))}
        </div>
      </section>

      {/* Inactive / History Licenses */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Inactive / Historical EAs</h2>
        {inactiveLicenses.length === 0 && <p>No historical licenses.</p>}
        <div style={styles.scrollableCards}>
          {inactiveLicenses.map(lic => (
            <div key={lic._id} style={styles.licenseCard}>
              <StatusBadge status="offline" label="Inactive License" />
              <p><strong>Plan:</strong> {lic.plan}</p>
              <p><strong>Broker:</strong> {lic.broker}</p>
              <p><strong>MT Login:</strong> {lic.mtLogin || lic.login}</p>
              <p><strong>Start Date:</strong> {new Date(lic.startDate).toLocaleDateString()}</p>
              <p><strong>Expiry Date:</strong> {new Date(lic.endDate).toLocaleDateString()}</p>
              <p><strong>License Key:</strong> {lic.licenseKey || lic.license_key}</p>
              <NeonButton onClick={() => generateEA(lic.licenseKey || lic.license_key)}>
                Re-download EA
              </NeonButton>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>FTSA AI - Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025</p>
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
  title: {
    fontSize: "2rem",
    margin: 0,
  },
  statusCards: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statusCard: {
    flex: 1,
    padding: "1rem",
    backgroundColor: "#111111",
    border: `2px solid ${neonCyan}`,
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: `0 0 10px ${neonCyan}`,
  },
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    textShadow: `0 0 10px ${neonCyan}`,
  },
  scrollableCards: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    maxHeight: "400px",
    overflowY: "auto",
  },
  licenseCard: {
    backgroundColor: "#111111",
    border: `2px solid ${neonCyan}`,
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: `0 0 10px ${neonCyan}`,
  },
  footer: {
    borderTop: `2px solid ${neonCyan}`,
    paddingTop: "1rem",
    textAlign: "center",
    marginTop: "2rem",
  },
  notAuth: {
    color: "#FF0000",
    padding: "2rem",
    fontFamily: "'Orbitron', sans-serif",
  },
};

export default EADownloadPage;
