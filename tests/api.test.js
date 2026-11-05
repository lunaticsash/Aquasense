import { describe, it, expect, vi } from "vitest";
import { createClient } from "../src/api/client";

const NOW = Date.parse("2026-11-05T12:00:00Z");
const res = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (body === undefined) throw new Error("bad json");
    return body;
  },
});
const status = (o = {}) => ({ level_percent: 55, pump_state: "off", last_seen: "2026-11-05T11:59:00Z", ...o });

const clientWith = (...responses) => {
  const fetchFn = vi.fn();
  responses.forEach((r) => (r instanceof Error ? fetchFn.mockRejectedValueOnce(r) : fetchFn.mockResolvedValueOnce(r)));
  return { api: createClient("http://mock", fetchFn), fetchFn };
};
const loggedIn = async (...next) => {
  const c = clientWith(res(200, { token: "abc" }), ...next);
  await c.api.login("u", "p");
  return c;
};

describe("POST /login", () => {
  it("TC01 returns token on valid credentials", async () => {
    const { api } = clientWith(res(200, { token: "abc" }));
    expect(await api.login("u", "p")).toBe("abc");
  });

  it("TC02 rejects wrong credentials", async () => {
    const { api } = clientWith(res(401, {}));
    await expect(api.login("u", "bad")).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("TC03 rejects response without token", async () => {
    const { api } = clientWith(res(200, {}));
    await expect(api.login("u", "p")).rejects.toMatchObject({ code: "MALFORMED" });
  });
});

describe("GET /device/{id}/status", () => {
  it("TC04 returns fresh status and sends bearer token", async () => {
    const { api, fetchFn } = await loggedIn(res(200, status()));
    const out = await api.getStatus("d1", NOW);
    expect(out).toMatchObject({ level_percent: 55, stale: false, anomaly: false });
    expect(fetchFn.mock.calls[1][1].headers.Authorization).toBe("Bearer abc");
  });

  it("TC05 invalid or expired token gives UNAUTHORIZED", async () => {
    const { api } = await loggedIn(res(401, {}));
    await expect(api.getStatus("d1", NOW)).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("TC06 unknown device gives NOT_FOUND", async () => {
    const { api } = await loggedIn(res(404, {}));
    await expect(api.getStatus("nope", NOW)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("TC07 stale last_seen (offline device) is flagged", async () => {
    const { api } = await loggedIn(res(200, status({ last_seen: "2026-11-05T11:50:00Z" })));
    expect((await api.getStatus("d1", NOW)).stale).toBe(true);
  });

  it("TC08 last_seen at exactly 5 min is not stale", async () => {
    const { api } = await loggedIn(res(200, status({ last_seen: "2026-11-05T11:55:00Z" })));
    expect((await api.getStatus("d1", NOW)).stale).toBe(false);
  });

  it.each([
    ["level above 100", { level_percent: 101 }],
    ["level below 0", { level_percent: -5 }],
    ["level null", { level_percent: null }],
    ["level as string", { level_percent: "55" }],
    ["pump_state invalid", { pump_state: "maybe" }],
    ["last_seen invalid", { last_seen: "yesterday" }],
  ])("TC09 malformed payload: %s", async (_, patch) => {
    const { api } = await loggedIn(res(200, status(patch)));
    await expect(api.getStatus("d1", NOW)).rejects.toMatchObject({ code: "MALFORMED" });
  });

  it("TC10 non-JSON body gives MALFORMED", async () => {
    const { api } = await loggedIn(res(200, undefined));
    await expect(api.getStatus("d1", NOW)).rejects.toMatchObject({ code: "MALFORMED" });
  });

  it("TC11 network failure gives NETWORK", async () => {
    const { api } = await loggedIn(new TypeError("fetch failed"));
    await expect(api.getStatus("d1", NOW)).rejects.toMatchObject({ code: "NETWORK" });
  });

  it("TC12 low level with pump off is an anomaly", async () => {
    const { api } = await loggedIn(res(200, status({ level_percent: 10, pump_state: "off" })));
    expect((await api.getStatus("d1", NOW)).anomaly).toBe(true);
  });
});