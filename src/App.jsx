import { processReadings } from "./lib/levels";
import raw from "./data/readings.json";
import AlertBanner from "./components/AlertBanner";
import AlertHistory from "./components/AlertHistory";
import LevelCards from "./components/LevelCards";
import LevelChart from "./components/LevelChart";
import "./App.css";

const summary = processReadings(raw);

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function App() {
  const { readings, current, min, max, date, isLow, lowEvents } = summary;

  return (
    <main className="app">
      <header className="app-header">
        <h1>AquaSense</h1>
        <p>{date ? `Tank level · ${formatDate(date)}` : "Tank level"}</p>
      </header>

      {readings.length === 0 ? (
        <p className="empty">No readings available.</p>
      ) : (
        <div className="stack">
          {isLow && <AlertBanner level={current} />}
          <LevelCards current={current} min={min} max={max} isLow={isLow} />
          <LevelChart readings={readings} />
          <AlertHistory events={lowEvents} />
        </div>
      )}
    </main>
  );
}
