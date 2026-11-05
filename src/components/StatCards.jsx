import { useEffect, useRef, useState } from "react";
import { LOW_LEVEL } from "../lib/insights";

function useCountUp(target, ms = 700) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (target == null) return;
    const from = prev.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prev.current = target;
      setV(target);
      return;
    }
    let raf, t0;
    const tick = (now) => {
      t0 ??= now;
      const p = Math.min((now - t0) / ms, 1);
      setV(Math.round(from + (target - from) * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

const Num = ({ value }) => {
  const v = useCountUp(value);
  return <>{value == null ? "--" : `${v}%`}</>;
};

const trend = (d) => (d.change > 0 ? `▲ +${d.change}%` : d.change < 0 ? `▼ ${d.change}%` : "● no change");

export default function StatCards({ current, min, max, minAt, maxAt, isLow, delta }) {
  const minLow = min != null && min < LOW_LEVEL;
  return (
    <section className="cards">
      <article className={`card ${isLow ? "low" : ""}`}>
        <span className="label">Current</span>
        <div className="row">
          <div>
            <strong className="num"><Num value={current} /></strong>
            <div className="chips">
              {current != null && <span className={`pill ${isLow ? "bad" : "good"}`}>{isLow ? "LOW" : "OK"}</span>}
              {delta && (
                <span className={`chip ${delta.change > 0 ? "up" : delta.change < 0 ? "down" : ""}`}>
                  {trend(delta)} since {delta.since}
                </span>
              )}
            </div>
          </div>
          <div className="tank" aria-hidden="true"><i style={{ "--lvl": `${current ?? 0}%` }} /></div>
        </div>
      </article>
      <article className={`card ${minLow ? "low" : ""}`}>
        <span className="label">Today's min</span>
        <strong className="num"><Num value={min} /></strong>
        <span className="sub">{minAt && `at ${minAt}`}</span>
      </article>
      <article className="card">
        <span className="label">Today's max</span>
        <strong className="num"><Num value={max} /></strong>
        <span className="sub">{maxAt && `at ${maxAt}`}</span>
      </article>
    </section>
  );
}