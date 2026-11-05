# AI Note

Tools: Claude (logic, tests, test plan) and Cursor with Grok 4.7 (React UI).

Prompt 1 (Claude): "<your real first prompt here>"
Prompt 2 (Cursor): "Build the UI only, using processReadings from src/lib/levels.js. Do not reimplement any logic."

What the AI got wrong, and how I fixed it:
<write the real issue here, 2 lines>

One decision I made myself: "today" is taken from the latest date in the data, not from new Date(). The mock data is from 2 Nov, so a system-clock filter would show an empty dashboard. The alert history is also shown separately from the current status, so a dip to 18% at 16:00 is not lost once the level recovers to 55%.