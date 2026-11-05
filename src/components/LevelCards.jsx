import { useEffect, useRef, useState } from "react";

function formatCount(shown, target) {
  if (Number.isInteger(target)) return `${Math.round(shown)}%`;
  return `${(Math.round(shown * 10) / 10).toFixed(1)}%`;
}

function CountUp({ value }) {
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = shownRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / 800);
      const next = from + (value - from) * (1 - (1 - t) ** 3);
      shownRef.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return formatCount(shown, value);
}

function Tank({ level }) {
  const height = Math.max(0, Math.min(48, (48 * level) / 100));

  return (
    <svg className="tank" viewBox="0 0 36 56" aria-hidden="true">
      <rect className="tank-shell" x="1.5" y="1.5" width="33" height="53" rx="8" />
      <clipPath id="tank-clip">
        <rect x="4" y="4" width="28" height="48" rx="5" />
      </clipPath>
      <g clipPath="url(#tank-clip)">
        <rect className="tank-water" x="4" y={52 - height} width="28" height={height} />
      </g>
    </svg>
  );
}

export default function LevelCards({ current, min, max, isLow }) {
  return (
    <section className="cards" aria-label="Tank levels">
      <article className="card current">
        <div className="current-row">
          <div>
            <span className="label">Current</span>
            <span className="value">
              <CountUp value={current} />
            </span>
            <span className={isLow ? "pill low" : "pill ok"}>{isLow ? "LOW" : "OK"}</span>
          </div>
          <Tank key={current} level={current} />
        </div>
      </article>
      <article className="card">
        <span className="label">Today's min</span>
        <span className="value">
          <CountUp value={min} />
        </span>
      </article>
      <article className="card">
        <span className="label">Today's max</span>
        <span className="value">
          <CountUp value={max} />
        </span>
      </article>
    </section>
  );
}
