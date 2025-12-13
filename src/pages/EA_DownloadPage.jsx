//src\pages\EA_DownloadPage.jsx
import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl";
import { useAuth } from "../contexts/AuthContext";

const EADownloadPage = () => {
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState(null);
  const [downloadFile, setDownloadFile] = useState(null);
  const [error, setError] = useState(null);

  // ---------------- FETCH ACTIVE LICENSE ----------------
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchLicense = async () => {
      try {
        const res = await APIControl.getActiveLicense(user.id);
        if (!res.success || !res.data) {
          setError("No active license found. Please subscribe first.");
        } else {
          setLicense(res.data);
        }
      } catch {
        setError("Failed to verify license. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLicense();
  }, [isAuthenticated, user]);

  // ---------------- GENERATE EA ----------------
  const generateEA = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await APIControl.generateEA(license.license_key);
      if (!res.success) {
        setError(res.error || "EA generation failed");
      } else {
        setDownloadFile(res.filename);
      }
    } catch {
      setError("EA generation error");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return <div style={styles.error}>Please log in to continue</div>;
  if (loading) return <LoadingSpinner />;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Download Your Customized EA</h1>
      </header>

      <div style={styles.card}>
        {error && (
          <>
            <StatusBadge status="error" label={error} />
            <NeonButton onClick={() => (window.location.href = "/status")}>
              Back to Subscription
            </NeonButton>
          </>
        )}

        {license && !error && (
          <>
            <StatusBadge status="online" label="Active License Found" />

            <p><strong>Broker:</strong> {license.broker}</p>
            <p><strong>MT Login ID:</strong> {license.mtLogin || license.login_id}</p>
            <p><strong>Expiry Date:</strong> {new Date(license.end_date).toLocaleDateString()}</p>
            <p><strong>License Key:</strong> {license.license_key}</p>

            {!downloadFile && (
              <NeonButton onClick={generateEA}>
                Generate EA
              </NeonButton>
            )}

            {downloadFile && (
              <a
                href={`/api/ea/download/${downloadFile}`}
                style={styles.downloadBtn}
                download
              >
                Download EA (.ex5)
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// -------- STYLES --------
const neonOrange = "#FF7A00";
const darkBg = "#0E1824";

const styles = {
  page: {
    backgroundColor: darkBg,
    minHeight: "100vh",
    color: "#fff",
    padding: "24px",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#11172C",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 0 15px rgba(0,0,0,0.5)",
  },
  downloadBtn: {
    display: "inline-block",
    background: neonOrange,
    color: "#111",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    textDecoration: "none",
    marginTop: "15px",
  },
  error: {
    color: "#FF5555",
    padding: "2rem",
  },
};

export default EADownloadPage;
