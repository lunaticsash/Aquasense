# AI Note

**Tools:** Claude (logic, tests, final UI) and Cursor (first UI pass).

**Prompt 1 (Claude): Define strict boundaries to ensure the AI assists with development without modifying the core logic.**
> I want you to act as my AI development assistant and work with me on this project.

> Before starting, analyse the requirements and break the project into smaller, manageable modules. Suggest an optimized folder structure, explain the purpose of each file, and define how the frontend, backend, database and APIs will interact.

> Be mindful of token usage and context limits. Avoid unnecessarily repeating information or generating huge code blocks. Work module by module and maintain a concise summary of architectural decisions, completed tasks and pending work so we can continue without losing context.

> I want to actively participate in development. Explain the logic before implementation, let me write important parts of the code, and review my implementations. Use AI-generated boilerplate where it saves time, but don't take over the entire development process.

> For backend integration, clearly define API contracts, request/response formats, database operations, authentication and error handling. After every major module, review the code for bugs, security, performance and maintainability.

> If a better approach exists, explain the trade-offs before suggesting changes. Don't assume code is correct just because it runs. Help me test and validate the actual functionality.

> Prioritize efficient AI assistance, modular development, context management and genuine developer involvement.

**Prompt 2 (Claude): UI redesign and extras**
> The UI feels flat. Make it simple but cool, with buttons and animations. Show a "Current: OK / LOW" status, make the 15% point clearly red in the low state, and add a small About and FAQ section. Don't touch levels.js. Put new derived logic (trend vs previous reading, time of min/max, refill detection) in a separate insights.js with its own tests.

**What the AI got wrong, and what I fixed**
1. The first levels.js validated timestamps with Date.parse, which also accepts non-ISO strings like "Nov 2, 2026". Since "today" is derived with slice(0, 10), such a row would give a wrong date. I caught this in review, added an ISO regex check and a test for it.
2. **Cursor was not good enough for the UI.** I gave it the UI first, but the result was plain, the last x-axis label was clipped, the 15% low point was faded instead of clearly red, and it ran out of budget before building the trend chip, min/max times and refill marker. I dropped it and rebuilt the UI with Claude on the same processReadings contract.
3. **Setup steps were incomplete.** `npm test` failed with "Missing script" because Vitest and the test script were not set up. I installed Vitest, added the script, and the suite then passed (32 tests).