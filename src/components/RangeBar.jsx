export default function RangeBar({ min, max, current, minAt, maxAt }) {
  if (min == null) return null;
  const pct = max === min ? 50 : ((current - min) / (max - min)) * 100;

  return (
    <section className="panel">
      <h2 className="center">Today's range</h2>
      <div className="range-labels">
        <div>
          <span className="label">Today's low</span>
          <b>{min}%</b>
          {minAt && <span className="sub">at {minAt}</span>}
        </div>
        <div className="right">
          <span className="label">Today's high</span>
          <b>{max}%</b>
          {maxAt && <span className="sub">at {maxAt}</span>}
        </div>
      </div>
      <div className="range" role="img" aria-label={`Current ${current}% between low ${min}% and high ${max}%`}>
        <i style={{ left: `${pct}%` }} />
      </div>
    </section>
  );
}