import { useLayoutEffect, useRef, useState } from "react";

const W = 640;
const H = 268;
const PAD = { top: 18, right: 48, bottom: 32, left: 40 };
const THRESHOLD = 20;

function formatTime(timestamp) {
  return timestamp.slice(11, 16);
}

export default function LevelChart({ readings }) {
  const lineRef = useRef(null);
  const [tip, setTip] = useState(null);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const count = readings.length;

  const x = (index) =>
    count <= 1 ? PAD.left + innerW / 2 : PAD.left + (index / (count - 1)) * innerW;
  const y = (level) => PAD.top + ((100 - level) / 100) * innerH;

  const linePath = readings
    .map((reading, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(reading.level_percent)}`)
    .join(" ");
  const areaPath = [
    `M${x(0)} ${PAD.top + innerH}`,
    ...readings.map((reading, index) => `L${x(index)} ${y(reading.level_percent)}`),
    `L${x(count - 1)} ${PAD.top + innerH} Z`,
  ].join(" ");
  const labelStep = Math.max(1, Math.ceil(count / 8));
  const ticks = [0, 25, 50, 75, 100];

  useLayoutEffect(() => {
    const path = lineRef.current;
    if (!path) return undefined;
    const length = path.getTotalLength();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    path.style.transition = "none";
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = reduce ? "0" : `${length}`;
    if (reduce) return undefined;

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1.15s ease";
        path.style.strokeDashoffset = "0";
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [linePath]);

  const tipAlign = !tip ? "" : tip.x > W * 0.78 ? "end" : tip.x < W * 0.22 ? "start" : "";

  return (
    <section className="panel">
      <h2>Level trend</h2>
      <div className="chart-wrap">
        <svg
          className="chart"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Tank level over time"
          onMouseLeave={() => setTip(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line className="grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
              <text className="axis axis-y" x={PAD.left - 8} y={y(tick)} dominantBaseline="middle">
                {tick}
              </text>
            </g>
          ))}
          <line
            className="threshold"
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(THRESHOLD)}
            y2={y(THRESHOLD)}
            strokeDasharray="6 4"
          />
          <text className="threshold-label" x={PAD.left + 8} y={y(THRESHOLD) - 8}>
            20%
          </text>
          {count > 1 && <path className="area" d={areaPath} />}
          <path ref={lineRef} className="line" d={linePath} />
          {readings.map((reading, index) => {
            const low = reading.level_percent < THRESHOLD;
            const showLabel = index === 0 || index === count - 1 || index % labelStep === 0;
            return (
              <g key={`${reading.timestamp}-${index}`}>
                <circle
                  className={low ? "dot low" : "dot"}
                  cx={x(index)}
                  cy={y(reading.level_percent)}
                  r="3.5"
                />
                <circle
                  className="hit"
                  cx={x(index)}
                  cy={y(reading.level_percent)}
                  r="12"
                  onMouseEnter={() =>
                    setTip({
                      x: x(index),
                      y: y(reading.level_percent),
                      time: formatTime(reading.timestamp),
                      level: reading.level_percent,
                    })
                  }
                />
                {showLabel && (
                  <text className="axis axis-x" x={x(index)} y={H - 10}>
                    {formatTime(reading.timestamp)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {tip && (
          <div
            className={`tooltip ${tipAlign}`}
            style={{ left: `${(tip.x / W) * 100}%`, top: `${(tip.y / H) * 100}%` }}
          >
            <span>{tip.time}</span>
            <strong>{tip.level}%</strong>
          </div>
        )}
      </div>
    </section>
  );
}
