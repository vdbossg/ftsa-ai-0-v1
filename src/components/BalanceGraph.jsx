// src/components/BalanceGraph.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BalanceGraph({ data }) {
  if (!data || data.length === 0)
    return <p style={{ color: "#FFA500" }}>No balance history available.</p>;

  // Detect format: array of numbers vs array of objects
  const chartData = data.map((item, index) => {
    if (typeof item === "number") {
      return { date: index + 1, balance: item };
    } else if (item && typeof item === "object" && "balance" in item) {
      return { date: item.date ?? index + 1, balance: item.balance };
    }
    return null;
  }).filter(Boolean); // remove nulls

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          label={{ value: "Trade #", position: "insideBottomRight", offset: -5 }}
        />
        <YAxis
          label={{ value: "Balance ($)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Line type="monotone" dataKey="balance" stroke="#00FF00" strokeWidth={2} dot={true} />
      </LineChart>
    </ResponsiveContainer>
  );
}
