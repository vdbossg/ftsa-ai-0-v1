import React, { useEffect, useState } from "react";

export default function NewsTicker() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news/today");
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error("News fetch error", err);
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // 1 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="news-ticker">
      {news.map((n, i) => (
        <span key={i} style={{ marginRight: "15px" }}>
          [{n.impact}] {n.time} - {n.title}
        </span>
      ))}
    </div>
  );
}
