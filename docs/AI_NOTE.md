# AI Note

**Tools:** Claude for planning, logic, tests and the final UI, because it follows strict constraints well and I could review its output module by module. Cursor for a first UI attempt, because it works inside the editor.


**Prompt 1 (Claude):** 
> "Break this project into small modules, suggest a folder structure, work module by module with concise summaries to save tokens, explain the logic before implementing, and review each module for bugs. I want to stay involved, so don't take over the whole build."

**Prompt 2 (Claude): UI redesign and extras**
> The UI feels flat. Make it simple but cool, with buttons and animations. Show a "Current: OK / LOW" status, make the 15% point clearly red in the low state, and add a small About and FAQ section. Don't touch levels.js. Put new derived logic (trend vs previous reading, time of min/max, refill detection) in a separate insights.js with its own tests.

**What the AI got wrong, and what I fixed**
1. The first levels.js validated timestamps with Date.parse, which also accepts non-ISO strings like "Nov 2, 2026". Since "today" is derived with slice(0, 10), such a row would give a wrong date. I caught this in review, added an ISO regex check and a test for it.
2. **Cursor was not good enough for the UI.** I gave it the UI first, but the result was plain, the last x-axis label was clipped, the 15% low point was faded instead of clearly red, and it ran out of budget before building the trend chip, min/max times and refill marker. I dropped it and rebuilt the UI with Claude on the same processReadings contract.
3. **Setup steps were incomplete.** `npm test` failed with "Missing script" because Vitest and the test script were not set up. I installed Vitest, added the script, and the suite then passed (32 tests).