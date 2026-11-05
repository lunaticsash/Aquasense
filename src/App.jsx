import { useEffect, useState } from "react";
import { processReadings } from "./lib/levels";
import { getDelta, timeOf, findRefills, hhmm } from "./lib/insights";
import raw from "./data/readings.json";
import StatCards from "./components/StatCards";
import LevelChart from "./components/LevelChart";
import Faq from "./components/FAQ.jsx";
import RangeBar from "./components/RangeBar.jsx";

const base = processReadings(raw);

function withLowReading() {
  const last = base.readings.at(-1);
  const ts = new Date(Date.parse(`${last.timestamp}Z`) + 2 * 3600e3)
    .toISOString()
    .slice(0, 19);
  return processReadings([...raw, { timestamp: ts, level_percent: 15 }]);
}

function prettyDate(date) {
  if (!date) return "No data";
  const d = new Date(`${date}T00:00:00Z`);
  const part = (o) => d.toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
  return `${part({ weekday: "short" })}, ${d.getUTCDate()} ${part({ month: "short" })} ${d.getUTCFullYear()}`;
}

export default function App() {
  const [demo, setDemo] = useState(false);
  const [theme, setTheme] = useState(() =>
    matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const { readings, current, min, max, date, isLow, lowEvents } = demo
    ? withLowReading()
    : base;

  const minAt = timeOf(readings, date, min);
  const maxAt = timeOf(readings, date, max);

  return (
    <>
      <div className="wave" aria-hidden="true" />
      <main className="wrap">
        <header className="top">
          <div className="brand">
            <svg className="logo" viewBox="0 0 32 32" aria-hidden="true">
              <defs>
                <linearGradient id="drop" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#2dd4bf" />
                  <stop offset="1" stopColor="#0f766e" />
                </linearGradient>
              </defs>
              <path
                d="M16 3C16 3 6 14 6 20a10 10 0 0 0 20 0C26 14 16 3 16 3Z"
                fill="url(#drop)"
              />
              <path
                d="M11 21a5 5 0 0 0 5 5"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity=".8"
              />
            </svg>
            <div>
              <h1>
                Aqua<span>Sense</span>
              </h1>
              <p className="muted">
                Know your tank before it runs dry · {prettyDate(date)}
              </p>
            </div>
          </div>
          <div className="actions">
            {demo && <span className="tag">DEMO MODE</span>}
            <button
              className="btn primary"
              onClick={() => setDemo(true)}
              disabled={demo || !readings.length}
            >
              Simulate low reading
            </button>
            <button
              className="btn"
              onClick={() => setDemo(false)}
              disabled={!demo}
            >
              Reset
            </button>
            <button
              className="btn icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>
        </header>

        {isLow && (
          <div className="banner" role="alert">
            <strong>Low water level.</strong> Tank is at {current}% (below 20%)
            as of {hhmm(readings.at(-1).timestamp)}.
          </div>
        )}

        <StatCards
          current={current}
          min={min}
          max={max}
          isLow={isLow}
          minAt={minAt}
          maxAt={maxAt}
          delta={getDelta(readings)}
        />
        
        <RangeBar
          min={min}
          max={max}
          current={current}
          minAt={minAt}
          maxAt={maxAt}
        />

        <section className="panel">
          <h2>Level trend</h2>
          <LevelChart readings={readings} refills={findRefills(readings)} />
        </section>

        <section className="panel">
          <h2 className="center">Alert history</h2>
          {lowEvents.length ? (
            <ul className="history">
              {lowEvents.map((e) => (
                <li key={e.timestamp}>
                  <span>
                    {e.timestamp.slice(0, 10)} {hhmm(e.timestamp)}
                  </span>
                  <b>{e.level_percent}%</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No readings below 20% so far.</p>
          )}
        </section>

        <Faq />

        <footer>
          <a
            href="https://github.com/lunaticsash/Aquasense"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>{" "}
          · AquaSense mini-build
        </footer>
      </main>
    </>
  );
}
