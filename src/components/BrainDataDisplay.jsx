import React from "react";
import { useBrainData } from "../context/BrainDataContext";
import LoadingSpinner from "./LoadingSpinner";
import StatusBadge from "./StatusBadge";

const BrainDataDisplay = () => {
  const { brainData, loading, error } = useBrainData();

  if (loading) {
    return (
      <div>
        <LoadingSpinner size={30} />
        <p>Loading brain data...</p>
      </div>
    );
  }

  if (error) {
    return <StatusBadge status="error" label={error} />;
  }

  return (
    <div>
      <h2>Brain Data</h2>
      <p>
        <strong>Last Decision:</strong> {brainData.lastDecision || "N/A"}
      </p>
      <p>
        <strong>Confidence Score:</strong> {brainData.confidenceScore}
      </p>
      <p>
        <strong>Trade Allowed:</strong> {brainData.tradeAllowed ? "Yes" : "No"}
      </p>
    </div>
  );
};

export default BrainDataDisplay;
