// src/components/BalanceGraph.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BalanceGraph({ data }) {
  if (!data || data.length === 0) return <p style={{ color: "#FFA500" }}>No balance history available.</p>;

  // Convert numbers to objects if needed
  const chartData = data.map((value, index) => ({
    date: index + 1,  // or use actual date if available
    balance: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" label={{ value: "Trade #", position: "insideBottomRight", offset: -5 }} />
        <YAxis label={{ value: "Balance ($)", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Line type="monotone" dataKey="balance" stroke="#00FF00" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
