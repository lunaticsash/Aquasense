function formatWhen(timestamp) {
  const date = timestamp.slice(0, 10);
  const time = timestamp.slice(11, 16);
  return `${date} ${time}`;
}

export default function AlertHistory({ events }) {
  return (
    <section className="panel" aria-label="Alert history">
      <h2>Alert history</h2>
      {events.length === 0 ? (
        <p className="muted">No low-level alerts recorded.</p>
      ) : (
        <ul className="history">
          {events.map((event, index) => (
            <li key={`${event.timestamp}-${index}`}>
              <time dateTime={event.timestamp}>{formatWhen(event.timestamp)}</time>
              <span className="level">{event.level_percent}%</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
