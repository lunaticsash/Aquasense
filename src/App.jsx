import { useState } from "react";
import { processReadings } from "./lib/levels";
import raw from "./data/readings.json";
import AlertBanner from "./components/AlertBanner";
import AlertHistory from "./components/AlertHistory";
import LevelCards from "./components/LevelCards";
import LevelChart from "./components/LevelChart";
import "./App.css";

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addHours(timestamp, hours) {
  const [datePart, timePart] = timestamp.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second = "0"] = timePart.split(":");
  const date = new Date(year, month - 1, day, Number(hour), Number(minute), Number(second));
  date.setHours(date.getHours() + hours);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function Wave() {
  return (
    <div className="wave" aria-hidden="true">
      <svg viewBox="0 0 2880 140" preserveAspectRatio="none">
        <path
          fill="rgba(255,255,255,0.55)"
          d="M0 78 Q180 40 360 78 T720 78 T1080 78 T1440 78 T1800 78 T2160 78 T2520 78 T2880 78 V140 H0 Z"
        />
        <path
          fill="rgba(15,118,110,0.16)"
          d="M0 96 Q180 70 360 96 T720 96 T1080 96 T1440 96 T1800 96 T2160 96 T2520 96 T2880 96 V140 H0 Z"
        />
      </svg>
    </div>
  );
}

export default function App() {
  const [extra, setExtra] = useState(null);
  const summary = processReadings(extra ? [...raw, extra] : raw);
  const { readings, current, min, max, date, isLow, lowEvents } = summary;
  const latest = readings.at(-1);

  function simulate() {
    const base = processReadings(raw).readings;
    if (!base.length || extra) return;
    setExtra({ timestamp: addHours(base.at(-1).timestamp, 2), level_percent: 15 });
  }

  return (
    <>
      <Wave />
      <main className="app">
        <header className="app-header">
          <div>
            <h1>AquaSense</h1>
            <p>{date ? `Tank level · ${formatDate(date)}` : "Tank level"}</p>
          </div>
          <div className="actions">
            {extra && <span className="demo-label">Demo mode</span>}
            <button className="btn primary" type="button" onClick={simulate} disabled={!readings.length || !!extra}>
              Simulate low reading
            </button>
            <button className="btn" type="button" onClick={() => setExtra(null)} disabled={!extra}>
              Reset
            </button>
          </div>
        </header>

        {readings.length === 0 ? (
          <p className="empty">No readings available.</p>
        ) : (
          <div className="stack">
            {isLow && <AlertBanner level={current} time={latest.timestamp} />}
            <LevelCards current={current} min={min} max={max} isLow={isLow} />
            <LevelChart key={latest.timestamp} readings={readings} />
            <AlertHistory events={lowEvents} />
          </div>
        )}
      </main>
    </>
  );
}
