// import { useLayoutEffect, useRef, useState } from "react";

// const W = 640;
// const H = 268;
// const PAD = { top: 18, right: 48, bottom: 32, left: 40 };
// const THRESHOLD = 20;

// function formatTime(timestamp) {
//   return timestamp.slice(11, 16);
// }

// export default function LevelChart({ readings }) {
//   const lineRef = useRef(null);
//   const [tip, setTip] = useState(null);
//   const innerW = W - PAD.left - PAD.right;
//   const innerH = H - PAD.top - PAD.bottom;
//   const count = readings.length;

//   const x = (index) =>
//     count <= 1 ? PAD.left + innerW / 2 : PAD.left + (index / (count - 1)) * innerW;
//   const y = (level) => PAD.top + ((100 - level) / 100) * innerH;

//   const linePath = readings
//     .map((reading, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(reading.level_percent)}`)
//     .join(" ");
//   const areaPath = [
//     `M${x(0)} ${PAD.top + innerH}`,
//     ...readings.map((reading, index) => `L${x(index)} ${y(reading.level_percent)}`),
//     `L${x(count - 1)} ${PAD.top + innerH} Z`,
//   ].join(" ");
//   const labelStep = Math.max(1, Math.ceil(count / 8));
//   const ticks = [0, 25, 50, 75, 100];

//   useLayoutEffect(() => {
//     const path = lineRef.current;
//     if (!path) return undefined;
//     const length = path.getTotalLength();
//     const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//     path.style.transition = "none";
//     path.style.strokeDasharray = `${length}`;
//     path.style.strokeDashoffset = reduce ? "0" : `${length}`;
//     if (reduce) return undefined;

//     let frame = requestAnimationFrame(() => {
//       frame = requestAnimationFrame(() => {
//         path.style.transition = "stroke-dashoffset 1.15s ease";
//         path.style.strokeDashoffset = "0";
//       });
//     });
//     return () => cancelAnimationFrame(frame);
//   }, [linePath]);

//   const tipAlign = !tip ? "" : tip.x > W * 0.78 ? "end" : tip.x < W * 0.22 ? "start" : "";

//   return (
//     <section className="panel">
//       <h2>Level trend</h2>
//       <div className="chart-wrap">
//         <svg
//           className="chart"
//           viewBox={`0 0 ${W} ${H}`}
//           role="img"
//           aria-label="Tank level over time"
//           onMouseLeave={() => setTip(null)}
//         >
//           {ticks.map((tick) => (
//             <g key={tick}>
//               <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
//               <text className="axis axis-y" x={PAD.left - 8} y={y(tick)} dominantBaseline="middle">
//                 {tick}
//               </text>
//             </g>
//           ))}
//           <line
//             className="threshold"
//             x1={PAD.left}
//             x2={W - PAD.right}
//             y1={y(THRESHOLD)}
//             y2={y(THRESHOLD)}
//             strokeDasharray="6 4"
//           />
//           <text className="threshold-label" x={PAD.left + 8} y={y(THRESHOLD) - 8}>
//             20%
//           </text>
//           {count > 1 && <path className="area" d={areaPath} />}
//           <path ref={lineRef} className="line" d={linePath} />
//           {readings.map((reading, index) => {
//             const low = reading.level_percent < THRESHOLD;
//             const showLabel = index === 0 || index === count - 1 || index % labelStep === 0;
//             return (
//               <g key={`${reading.timestamp}-${index}`}>
//                 <circle
//                   className={low ? "dot low" : "dot"}
//                   cx={x(index)}
//                   cy={y(reading.level_percent)}
//                   r="3.5"
//                 />
//                 <circle
//                   className="hit"
//                   cx={x(index)}
//                   cy={y(reading.level_percent)}
//                   r="12"
//                   onMouseEnter={() =>
//                     setTip({
//                       x: x(index),
//                       y: y(reading.level_percent),
//                       time: formatTime(reading.timestamp),
//                       level: reading.level_percent,
//                     })
//                   }
//                 />
//                 {showLabel && (
//                   <text className="axis axis-x" x={x(index)} y={H - 10}>
//                     {formatTime(reading.timestamp)}
//                   </text>
//                 )}
//               </g>
//             );
//           })}
//         </svg>
//         {tip && (
//           <div
//             className={`tooltip ${tipAlign}`}
//             style={{ left: `${(tip.x / W) * 100}%`, top: `${(tip.y / H) * 100}%` }}
//           >
//             <span>{tip.time}</span>
//             <strong>{tip.level}%</strong>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }


import { useState } from "react";
import { hhmm, LOW_LEVEL } from "../lib/insights";

const W = 720, H = 320, P = { l: 44, r: 44, t: 24, b: 40 };

export default function LevelChart({ readings, refills }) {
  const [hover, setHover] = useState(null);
  if (!readings.length) return <p className="muted">No valid readings to display.</p>;

  const ts = (r) => Date.parse(r.timestamp);
  const t0 = ts(readings[0]);
  const span = ts(readings.at(-1)) - t0 || 1;
  const x = (t) => P.l + ((t - t0) / span) * (W - P.l - P.r);
  const y = (v) => P.t + (1 - v / 100) * (H - P.t - P.b);

  const pts = readings.map((r) => [x(ts(r)), y(r.level_percent), r]);
  const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px},${py}`).join("");
  const area = `${line}L${pts.at(-1)[0]},${y(0)}L${pts[0][0]},${y(0)}Z`;

  const h = pts[hover] ?? null;
  const tx = h && Math.min(Math.max(h[0] - 42, 4), W - 88);
  const ty = h && (h[1] > 60 ? h[1] - 52 : h[1] + 14);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Tank level over time with 20 percent alert line">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} className="grid" />
          <text x={P.l - 10} y={y(v) + 4} textAnchor="end" className="tick">{v}</text>
        </g>
      ))}

      <path d={area} className="area" />
      <path key={line} d={line} pathLength="1" className="line" />

      <line x1={P.l} x2={W - P.r} y1={y(LOW_LEVEL)} y2={y(LOW_LEVEL)} className="thr" />
      <text x={P.l + 6} y={y(LOW_LEVEL) - 6} className="thr-label">20% alert level</text>

      {refills.map((f) => {
        const mx = (x(Date.parse(f.from)) + x(Date.parse(f.to))) / 2;
        const my = Math.max(y(f.toLevel) - 30, 4);
        return (
          <g key={f.to} className="refill">
            <rect x={mx - 48} y={my} width="96" height="22" rx="11" />
            <text x={mx} y={my + 15} textAnchor="middle">Refill +{f.rise}%</text>
          </g>
        );
      })}

      {pts.map(([px, py, r], i) => (
        <g key={r.timestamp}>
          <text x={px} y={H - 14} textAnchor="middle" className="tick">{hhmm(r.timestamp)}</text>
          <circle cx={px} cy={py} r="5" className={r.level_percent < LOW_LEVEL ? "dot low" : "dot"} />
          <circle
            cx={px} cy={py} r="16" className="hit" tabIndex="0"
            aria-label={`${hhmm(r.timestamp)}, ${r.level_percent}%`}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)} onBlur={() => setHover(null)}
          />
        </g>
      ))}

      {h && (
        <g className="tip" pointerEvents="none">
          <rect x={tx} y={ty} width="84" height="38" rx="8" />
          <text x={tx + 10} y={ty + 16}>{hhmm(h[2].timestamp)}</text>
          <text x={tx + 10} y={ty + 31} fontWeight="700">{h[2].level_percent}%</text>
        </g>
      )}
    </svg>
  );
}