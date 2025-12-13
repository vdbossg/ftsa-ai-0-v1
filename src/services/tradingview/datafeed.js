// src/services/tradingview/datafeed.js
//
// Production-focused TradingView Datafeed supporting:
//  - Crypto: Binance (REST + WebSocket klines for realtime)
//  - Stocks/Forex: TwelveData (REST, requires API key) with polling fallback
//  - Fallback to Yahoo for some stock history if TwelveData isn't available
//
// Requirements:
//  - npm install axios
//  - Add REACT_APP_TWELVEDATA_API_KEY to your environment if you want stocks/forex.
//  - Save this file as: /src/services/tradingview/datafeed.js

import axios from "axios";

/* --------------------------- Configuration --------------------------- */

const TWELVEDATA_API_KEY = process.env.REACT_APP_TWELVEDATA_API_KEY || "";
const TWELVEDATA_BASE = "https://api.twelvedata.com";
const BINANCE_REST_BASE = "https://api.binance.com";
const BINANCE_WS_BASE = "wss://stream.binance.com:9443/ws";

const supportedResolutions = [
  "1", "3", "5", "15", "30", "60", "120", "240",
  "1D", "1W", "1M"
];

/* interval mapping helpers */
const tvToBinance = (resolution) => {
  // TradingView -> Binance interval
  // note: Binance intervals: 1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M
  if (resolution === "1") return "1m";
  if (resolution === "3") return "3m";
  if (resolution === "5") return "5m";
  if (resolution === "15") return "15m";
  if (resolution === "30") return "30m";
  if (resolution === "60") return "1h";
  if (resolution === "120") return "2h";
  if (resolution === "240") return "4h";
  if (resolution === "1D") return "1d";
  if (resolution === "1W") return "1w";
  if (resolution === "1M") return "1M";
  // default
  return "1m";
};

const tvToTwelve = (resolution) => {
  // TwelveData supports "1min", "5min", "15min", "30min", "1h", "1day", "1wk", "1mo"
  if (resolution === "1") return "1min";
  if (resolution === "3") return "3min";
  if (resolution === "5") return "5min";
  if (resolution === "15") return "15min";
  if (resolution === "30") return "30min";
  if (resolution === "60") return "1h";
  if (resolution === "120") return "2h";
  if (resolution === "240") return "4h";
  if (resolution === "1D") return "1day";
  if (resolution === "1W") return "1wk";
  if (resolution === "1M") return "1mo";
  return "1min";
};

/* --------------------------- Internal state --------------------------- */

// store subscribers for non-crypto polling: { subscriberUID: {timerId, lastBar, ...} }
const _subscribers = {};

// store websocket handlers for crypto realtime
const _binanceWS = {}; // key: streamName -> ws instance
const _cryptoSubscribers = {}; // subscriberUID -> {symbol, resolution, callback}

/* --------------------------- Utilities --------------------------- */

function dateToUnixSeconds(d) {
  return Math.floor(d / 1000);
}

function unixMsToTvTime(ms) {
  // TradingView expects `time` in milliseconds since epoch
  return ms;
}

/* --------------------------- Symbol helpers --------------------------- */

async function searchSymbols(searchString, exchange, symbolType) {
  // Prefer TwelveData symbol_search if available
  if (TWELVEDATA_API_KEY) {
    try {
      const res = await axios.get(`${TWELVEDATA_BASE}/symbols`, {
        params: { apikey: TWELVEDATA_API_KEY, symbol: searchString },
      });
      // TwelveData returns a list of symbols
      if (res?.data?.data) {
        return res.data.data.map((s) => ({
          symbol: s.symbol,
          full_name: `${s.exchange}:${s.symbol}`,
          description: s.name || s.symbol,
          exchange: s.exchange,
          ticker: s.symbol,
          type: s.currency ? "crypto" : "stock",
        }));
      }
    } catch (e) {
      console.warn("TwelveData symbol search failed:", e.message);
    }
  }

  // Fallback minimal local matches (user can extend this)
  const local = [
    { symbol: "AAPL", full_name: "NASDAQ:AAPL", description: "Apple Inc.", exchange: "NASDAQ", ticker: "AAPL", type: "stock" },
    { symbol: "GOOG", full_name: "NASDAQ:GOOG", description: "Alphabet Inc.", exchange: "NASDAQ", ticker: "GOOG", type: "stock" },
    { symbol: "BTCUSDT", full_name: "BINANCE:BTCUSDT", description: "Bitcoin / Tether", exchange: "BINANCE", ticker: "BTCUSDT", type: "crypto" },
    { symbol: "ETHUSDT", full_name: "BINANCE:ETHUSDT", description: "Ethereum / Tether", exchange: "BINANCE", ticker: "ETHUSDT", type: "crypto" },
    { symbol: "EUR/USD", full_name: "FOREX:EUR/USD", description: "EUR / USD", exchange: "FOREX", ticker: "EUR/USD", type: "forex" },
  ];

  return local.filter((s) => s.symbol.toLowerCase().includes(searchString.toLowerCase()));
}

/* --------------------------- Datafeed API --------------------------- */

const datafeed = {
  onReady: (callback) => {
    // Return features / capabilities
    setTimeout(() => {
      callback({
        supported_resolutions: supportedResolutions,
        supports_marks: false,
        supports_time: true,
        supports_search: true,
        supports_group_request: false,
      });
    }, 0);
  },

  searchSymbols: async (userInput, exchange, symbolType, onResult) => {
    try {
      const results = await searchSymbols(userInput, exchange, symbolType);
      onResult(results);
    } catch (e) {
      console.error("searchSymbols error", e);
      onResult([]);
    }
  },

  resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    // Normalize incoming symbol formats
    try {
      // If user provided "BINANCE:BTCUSDT" or "BTCUSDT"
      let name = symbolName;
      if (symbolName.includes(":")) {
        const parts = symbolName.split(":");
        name = parts[1];
      }
      // Try TwelveData metadata if available
      if (TWELVEDATA_API_KEY) {
        try {
          const td = await axios.get(`${TWELVEDATA_BASE}/symbol_search`, {
            params: { symbol: name, apikey: TWELVEDATA_API_KEY },
          });
          if (td?.data?.data && td.data.data.length > 0) {
            const s = td.data.data[0];
            const symbolInfo = {
              name: s.symbol,
              description: s.name || s.instrument_name || s.symbol,
              type: s.type || "stock",
              session: "24x7",
              timezone: s.exchange_timezone || "Etc/UTC",
              ticker: s.symbol,
              exchange: s.exchange || "",
              minmov: 1,
              pricescale: s.currency === "USD" ? 100 : 100,
              has_intraday: true,
              supported_resolutions: supportedResolutions,
            };
            onSymbolResolvedCallback(symbolInfo);
            return;
          }
        } catch (e) {
          // ignore and fallback
        }
      }

      // Fallback heuristics
      // Crypto: treat BTCUSD/BTCUSDT/ETHUSD -> Binance format BTCUSDT
      const up = name.toUpperCase().replace("/", "");
      let symbolInfo = null;
      if (/^[A-Z]{3,5}(USD|USDT|USDC)$/.test(up) || up.endsWith("USDT") || up.endsWith("BTC")) {
        // crypto candidate
        const bin = up.endsWith("USD") ? `${up}T` : up; // silly attempt; better to normalize
        symbolInfo = {
          name: up,
          ticker: up,
          type: "crypto",
          session: "24x7",
          timezone: "Etc/UTC",
          exchange: "BINANCE",
          minmov: 1,
          pricescale: 100,
          has_intraday: true,
          supported_resolutions: supportedResolutions,
        };
        onSymbolResolvedCallback(symbolInfo);
        return;
      }

      // Forex pair like EURUSD or EUR/USD
      if (/^[A-Z]{6}$/.test(up) || /^[A-Z]{3}\/[A-Z]{3}$/.test(symbolName)) {
        const ticker = up.includes("/") ? up.replace("/", "") : up;
        symbolInfo = {
          name: ticker,
          ticker,
          type: "forex",
          session: "24x5",
          timezone: "Etc/UTC",
          exchange: "FOREX",
          minmov: 1,
          pricescale: 100000, // forex precision
          has_intraday: true,
          supported_resolutions: supportedResolutions,
        };
        onSymbolResolvedCallback(symbolInfo);
        return;
      }

      // Last fallback: treat as stock
      symbolInfo = {
        name: up,
        ticker: up,
        type: "stock",
        session: "0930-1600",
        timezone: "Etc/UTC",
        exchange: "NYSE",
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        supported_resolutions: supportedResolutions,
      };
      onSymbolResolvedCallback(symbolInfo);
    } catch (err) {
      console.error("resolveSymbol error", err);
      onResolveErrorCallback("Cannot resolve symbol");
    }
  },

  getBars: async (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, isFirstLoad) => {
    // from, to are in UNIX seconds
    try {
      const bars = [];

      // Normalize timeframe
      const tvResolution = resolution;
      // If numeric like "60" TradingView sometimes provides string numbers for intraday
      // Use different providers depending on type
      if (symbolInfo.type === "crypto") {
        // Binance REST klines (ms timestamps)
        const binInterval = tvToBinance(tvResolution);
        // Binance expects symbol like BTCUSDT
        const symbol = symbolInfo.name.replace("/", "").toUpperCase();
        const start = from * 1000;
        const end = to * 1000;
        const url = `${BINANCE_REST_BASE}/api/v3/klines?symbol=${symbol}&interval=${binInterval}&startTime=${start}&endTime=${end}&limit=1000`;
        const r = await axios.get(url);
        // r.data is array of arrays
        r.data.forEach((k) => {
          const bar = {
            time: k[0], // ms
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
          };
          bars.push(bar);
        });

        if (bars.length) {
          onHistoryCallback(bars, { noData: false });
        } else {
          onHistoryCallback([], { noData: true });
        }
        return;
      }

      // For stocks/forex, prefer TwelveData if key provided
      if (TWELVEDATA_API_KEY) {
        const tdInterval = tvToTwelve(tvResolution);
        // TwelveData expects symbol like AAPL, or "EUR/USD" for forex
        let symbol = symbolInfo.name;
        // convert EURUSD -> EUR/USD for TwelveData forex
        if (symbolInfo.type === "forex") {
          symbol = symbol.includes("/") ? symbol : `${symbol.slice(0,3)}/${symbol.slice(3)}`;
        }
        const params = {
          symbol,
          interval: tdInterval,
          start_date: new Date(from * 1000).toISOString(),
          end_date: new Date(to * 1000).toISOString(),
          timezone: "UTC",
          apikey: TWELVEDATA_API_KEY,
          // outputsize: 5000,
        };
        try {
          const resp = await axios.get(`${TWELVEDATA_BASE}/time_series`, { params });
          if (resp.data && resp.data.values) {
            // TwelveData returns newest-first or oldest-first based on params; ensure to map
            // values: [{ datetime, open, high, low, close, volume }]
            const values = resp.data.values.slice().reverse(); // make oldest-first
            values.forEach((v) => {
              bars.push({
                time: new Date(v.datetime).getTime(),
                open: parseFloat(v.open),
                high: parseFloat(v.high),
                low: parseFloat(v.low),
                close: parseFloat(v.close),
                volume: parseFloat(v.volume || 0),
              });
            });
          }
        } catch (e) {
          console.warn("TwelveData time_series failed:", e?.response?.data || e.message);
        }
      }

      // If no data from TwelveData, fallback to Yahoo (stocks only)
      if (bars.length === 0) {
        if (symbolInfo.type === "stock") {
          // Yahoo Finance chart endpoint (periods in seconds)
          // interval param examples: 1m,5m,15m,60m,1d
          const interval = (function () {
            if (tvResolution === "1") return "1m";
            if (tvResolution === "3") return "3m";
            if (tvResolution === "5") return "5m";
            if (tvResolution === "15") return "15m";
            if (tvResolution === "30") return "30m";
            if (tvResolution === "60") return "60m";
            if (tvResolution === "240") return "1h";
            if (tvResolution === "1D") return "1d";
            if (tvResolution === "1W") return "1wk";
            if (tvResolution === "1M") return "1mo";
            return "1d";
          })();
          const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbolInfo.name}?period1=${from}&period2=${to}&interval=${interval}`;
          try {
            const r = await axios.get(url);
            const result = r?.data?.chart?.result?.[0];
            if (result) {
              const timestamps = result.timestamp || [];
              const o = result.indicators?.quote?.[0]?.open || [];
              const h = result.indicators?.quote?.[0]?.high || [];
              const l = result.indicators?.quote?.[0]?.low || [];
              const c = result.indicators?.quote?.[0]?.close || [];
              const v = result.indicators?.quote?.[0]?.volume || [];
              for (let i = 0; i < timestamps.length; i++) {
                bars.push({
                  time: timestamps[i] * 1000,
                  open: o[i],
                  high: h[i],
                  low: l[i],
                  close: c[i],
                  volume: v[i] || 0,
                });
              }
            }
          } catch (e) {
            console.warn("Yahoo finance fallback failed:", e.message);
          }
        }
      }

      if (bars.length) {
        onHistoryCallback(bars, { noData: false });
      } else {
        onHistoryCallback([], { noData: true });
      }
    } catch (err) {
      console.error("getBars error", err);
      onErrorCallback(err);
    }
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
    // Crypto -> use Binance websocket per-symbol kline streams
    try {
      if (symbolInfo.type === "crypto") {
        const symbol = symbolInfo.name.replace("/", "").toLowerCase(); // e.g. btcusdt
        const binInterval = tvToBinance(resolution);
        const streamName = `${symbol}@kline_${binInterval}`;
        // If websocket for stream not created, create it
        if (!_binanceWS[streamName]) {
          // create WS and attach general message handler that fans out to subscribers
          const ws = new WebSocket(`${BINANCE_WS_BASE}/${streamName}`);
          _binanceWS[streamName] = ws;
          ws.onmessage = (evt) => {
            try {
              const msg = JSON.parse(evt.data);
              // msg.k contains kline object
              const k = msg.k;
              if (!k) return;
              const bar = {
                time: k.t, // ms
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                volume: parseFloat(k.v),
              };
              // Fan out to all crypto subscribers matching symbol & interval
              Object.values(_cryptoSubscribers).forEach((sub) => {
                if (sub.symbol.replace("/", "").toLowerCase() === symbol && tvToBinance(sub.resolution) === binInterval) {
                  try {
                    sub.callback(bar);
                  } catch (e) {
                    console.warn("subscriber callback failed", e);
                  }
                }
              });
            } catch (e) {
              console.error("WS parse error", e);
            }
          };
          ws.onopen = () => {
            console.info("Binance WS open for", streamName);
          };
          ws.onerror = (e) => {
            console.warn("Binance WS error", e);
          };
          ws.onclose = () => {
            console.info("Binance WS closed for", streamName);
            // Clean up - allow reconnect logic here if desired
            delete _binanceWS[streamName];
          };
        }
        // register subscriber
        _cryptoSubscribers[subscriberUID] = {
          symbol: symbolInfo.name,
          resolution,
          callback: onRealtimeCallback,
        };
        return;
      }

      // For stocks/forex - implement polling (every N seconds depending on resolution)
      const pollIntervalMs = (function () {
        // choose polling frequency based on resolution
        if (["1", "3", "5"].includes(resolution)) return 5000;
        if (["15", "30"].includes(resolution)) return 15000;
        if (["60", "120", "240"].includes(resolution)) return 30000;
        return 60000;
      })();

      // keep last bar and poll endpoint for new bars
      let lastBar = null;
      const fetchAndNotify = async () => {
        try {
          // fetch recent bars for last X minutes
          const to = Math.floor(Date.now() / 1000);
          const from = to - 60 * 60 * 24; // last day - safe window
          datafeed.getBars(
            symbolInfo,
            resolution,
            from,
            to,
            (bars, meta) => {
              if (!bars || bars.length === 0) return;
              const latest = bars[bars.length - 1];
              if (!lastBar || latest.time !== lastBar.time || latest.close !== lastBar.close) {
                lastBar = latest;
                try {
                  onRealtimeCallback(latest);
                } catch (e) {
                  console.warn("onRealtimeCallback failed", e);
                }
              }
            },
            (err) => {
              console.warn("polling getBars error", err);
            },
            false
          );
        } catch (e) {
          console.error("polling fetch failed", e);
        }
      };

      const timerId = setInterval(fetchAndNotify, pollIntervalMs);
      // store subscriber
      _subscribers[subscriberUID] = {
        timerId,
        symbolInfo,
        resolution,
      };

      // call immediately once
      fetchAndNotify();
    } catch (err) {
      console.error("subscribeBars error", err);
    }
  },

  unsubscribeBars: (subscriberUID) => {
    // crypto
    if (_cryptoSubscribers[subscriberUID]) {
      delete _cryptoSubscribers[subscriberUID];
      return;
    }
    // polling
    const sub = _subscribers[subscriberUID];
    if (sub) {
      clearInterval(sub.timerId);
      delete _subscribers[subscriberUID];
    }
  },
};

export default datafeed;
