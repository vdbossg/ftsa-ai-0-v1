// server/services/newsService.js
const { chromium } = require("playwright");

// Cache to avoid repeated requests
let cachedEvents = [];
let lastFetched = 0;

// Map impact string to emoji
const mapImpact = (importance) => {
  switch ((importance || "").toLowerCase()) {
    case "high": return "🟥";
    case "medium": return "🟧";
    case "low": return "🟨";
    case "holiday": return "⬛";
    default: return "❓";
  }
};
// Parse Forex Factory date string like "Mon\nSep 22" into a Date object
const parseFFDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("\n"); // e.g., ["Mon", "Sep 22"]
  if (parts.length < 2) return null;
  const monthDay = parts[1]; // "Sep 22"
  const [monthStr, day] = monthDay.split(" ");
  const monthMap = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  const month = monthMap[monthStr];
  if (month === undefined) return null;
  const year = new Date().getFullYear();
  return new Date(year, month, parseInt(day, 10));
};

// Get today's date as a Date object (year/month/day)
const getTodayObj = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// Today's date in YYYY-MM-DD
const getToday = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Fetch ForexFactory economic calendar via Playwright
exports.getLatestEconomicEvents = async () => {
  const now = Date.now();
  if (now - lastFetched < 60 * 1000 && cachedEvents.length) {
    return cachedEvents;
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
    });
    const page = await context.newPage();

    await page.goto("https://www.forexfactory.com/calendar", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("table.calendar__table", { timeout: 30000 });

   const events = await page.$$eval("table.calendar__table tbody tr", (rows) => {
  let lastDate = "";
  let lastTime = "";

  return rows.map((row) => {
    const dateCol = row.querySelector("td.calendar__date")?.innerText.trim() || "";
    const timeCol = row.querySelector("td.calendar__time")?.innerText.trim() || "";
    const currencyCol = row.querySelector("td.calendar__currency")?.innerText.trim() || "";
    const eventCol = row.querySelector("td.calendar__event")?.innerText.trim() || "";
    const impactCell = row.querySelector("td.calendar__impact span");
    let impactText = "";

    if (impactCell) {
      const classes = impactCell.className || "";
      if (classes.includes("icon--ff-impact-red")) {
        impactText = "High";
      } else if (classes.includes("icon--ff-impact-ora")) {
        impactText = "Medium";
      } else if (classes.includes("icon--ff-impact-yel")) {
        impactText = "Low";
      } else if (classes.includes("icon--ff-impact-hol")) {
        impactText = "Holiday";
      }
    }

    const actualCol = row.querySelector("td.calendar__actual")?.innerText.trim() || "";
    const forecastCol = row.querySelector("td.calendar__forecast")?.innerText.trim() || "";
    const previousCol = row.querySelector("td.calendar__previous")?.innerText.trim() || "";

    if (dateCol && dateCol !== "-") lastDate = dateCol;
    if (timeCol && timeCol !== "-") lastTime = timeCol;

    // ✅ Skip empty/separator rows
    if (!currencyCol && !eventCol && !impactText) {
      return null;
    }

    return {
      date: lastDate || null,
      time: lastTime || null,
      currency: currencyCol || null,
      event: eventCol || null,
      impact: impactText || null,
      actual: actualCol || null,
      forecast: forecastCol || null,
      previous: previousCol || null,
    };
  }).filter(Boolean); // removes the nulls
});



    await browser.close();
   const today = getTodayObj();

const safeEvents = Array.isArray(events) ? events : [];

const todayEvents = safeEvents.filter(e => {
  const eventDate = parseFFDate(e.date);
  if (!eventDate) return false;
  return eventDate.getTime() === today.getTime();
});



cachedEvents = todayEvents.length ? todayEvents : safeEvents.slice(0, 10);


    lastFetched = now;

    // Map impact emojis
    cachedEvents.forEach(e => e.impact = mapImpact(e.impact));

    return cachedEvents;
  } catch (err) {
    console.error("Failed to fetch live news via Playwright:", err.message);
    return cachedEvents;
  }
};
