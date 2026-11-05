function formatPercent(value) {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

export default function LevelCards({ current, min, max, isLow }) {
  const cards = [
    { key: "current", label: "Current", value: current, low: isLow },
    { key: "min", label: "Today's min", value: min },
    { key: "max", label: "Today's max", value: max },
  ];

  return (
    <section className="cards" aria-label="Tank levels">
      {cards.map((card) => (
        <article
          key={card.key}
          className={card.key === "current" ? `card current${card.low ? " low" : ""}` : "card"}
        >
          <span className="label">{card.label}</span>
          <span className="value">{formatPercent(card.value)}</span>
        </article>
      ))}
    </section>
  );
}
