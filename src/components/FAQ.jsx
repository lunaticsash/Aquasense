import { useState } from "react";

const ITEMS = [
  ["How is \"today\" decided?", "It uses the latest date found in the data (2 Nov 2026 in the mock set), not your system clock, so the dashboard works with any dataset."],
  ["When does the alert trigger?", "When the current level is strictly below 20%. Exactly 20% is still OK. Earlier dips stay listed in Alert history."],
  ["What does Simulate low reading do?", "It adds a demo reading of 15%, two hours after the latest one, so you can see the alert state. Reset restores the real data. Nothing is saved."],
  ["How is a refill detected?", "A rise of 15 points or more between two consecutive readings is marked as a refill on the chart."],
  ["What happens with bad data?", "Readings that are missing, non-numeric, outside 0 to 100 or with a non-ISO timestamp are ignored. The rest are sorted by time."],
];

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="panel">
      <h2 className="center">About</h2>
      <p className="muted">
        AquaSense turns raw tank readings into a clear picture: where the level is now, how low it went today,
        and whether it needs attention. Built as the AquaSense mini-build by Pranjal.
      </p>
      <h2 className="faq-title center">FAQ</h2>
      {ITEMS.map(([q, a], i) => (
        <div key={q} className={`faq ${open === i ? "open" : ""}`}>
          <button aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
            {q}<span aria-hidden="true">+</span>
          </button>
          <div id={`faq-${i}`} className="faq-body"><div><p>{a}</p></div></div>
        </div>
      ))}
    </section>
  );
}