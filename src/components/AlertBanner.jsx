export default function AlertBanner({ level, time }) {
  const shown = Number.isInteger(level) ? level : Number(level).toFixed(1);
  const clock = time.slice(11, 16);

  return (
    <div className="alert" role="alert">
      Low water level at <time dateTime={time}>{clock}</time> — tank is at {shown}% (below 20%).
    </div>
  );
}
