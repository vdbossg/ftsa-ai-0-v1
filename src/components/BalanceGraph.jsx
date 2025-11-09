// src/components/BalanceGraph.jsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BalanceGraph({ data }) {
  if (!data || data.length === 0) return <p>No balance history available.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="balance" stroke="#00FF00" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
