export default function AlertBanner({ level }) {
  const shown = Number.isInteger(level) ? level : level.toFixed(1);

  return (
    <div className="alert" role="alert">
      Low water level — tank is at {shown}% (below 20%).
    </div>
  );
}
