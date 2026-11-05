const W = 640;
const H = 260;
const PAD = { top: 18, right: 12, bottom: 28, left: 36 };
const THRESHOLD = 20;

function formatTime(timestamp) {
  return timestamp.slice(11, 16);
}

export default function LevelChart({ readings }) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const count = readings.length;

  const x = (index) =>
    count <= 1 ? PAD.left + innerW / 2 : PAD.left + (index / (count - 1)) * innerW;
  const y = (level) => PAD.top + ((100 - level) / 100) * innerH;

  const coords = readings.map((reading, index) => `${x(index)},${y(reading.level_percent)}`);
  const line = coords.join(" ");
  const area = [
    `${x(0)},${PAD.top + innerH}`,
    ...coords,
    `${x(count - 1)},${PAD.top + innerH}`,
  ].join(" ");
  const labelStep = Math.max(1, Math.ceil(count / 8));
  const ticks = [0, 25, 50, 75, 100];

  return (
    <section className="panel">
      <h2>Level trend</h2>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Tank level over time">
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
        <text className="threshold-label" x={W - PAD.right} y={y(THRESHOLD) - 6}>
          20%
        </text>
        {count > 1 && <polygon className="area" points={area} />}
        <polyline className="line" points={line} fill="none" />
        {readings.map((reading, index) => (
          <g key={`${reading.timestamp}-${index}`}>
            <circle
              className={reading.level_percent < THRESHOLD ? "dot low" : "dot"}
              cx={x(index)}
              cy={y(reading.level_percent)}
              r="3.5"
            >
              <title>
                {formatTime(reading.timestamp)} · {reading.level_percent}%
              </title>
            </circle>
            {index % labelStep === 0 && (
              <text className="axis axis-x" x={x(index)} y={H - 8}>
                {formatTime(reading.timestamp)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </section>
  );
}
