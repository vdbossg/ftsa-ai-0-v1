import React, { useEffect, useState } from "react";

export default function StrengthTable() {
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    const fetchStrength = async () => {
      try {
        const res = await fetch("/api/brain/strength");
        const data = await res.json();
        setPairs(data);
      } catch (err) {
        console.error("Strength fetch error", err);
      }
    };
    fetchStrength();
    const interval = setInterval(fetchStrength, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>%</th>
          <th>Strength</th>
        </tr>
      </thead>
      <tbody>
        {pairs.map((p) => (
          <tr key={p.symbol}>
            <td>{p.symbol}</td>
            <td>{p.percent}%</td>
            <td>{p.color}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
