import { useState, useEffect } from 'react';

export default function useMarketStrength(refreshMs = 10000) {
  const [strengthData, setStrengthData] = useState([]);

  useEffect(() => {
    const fetchStrength = async () => {
      try {
        const res = await fetch('/api/bias');
        const data = await res.json();
        setStrengthData(data);
      } catch (err) {
        console.error('Error fetching market strength:', err);
      }
    };

    fetchStrength();
    const interval = setInterval(fetchStrength, refreshMs);
    return () => clearInterval(interval);
  }, [refreshMs]);

  return strengthData;
}
