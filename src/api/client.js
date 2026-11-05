const STALE_MS = 5 * 60 * 1000;
const PUMP_STATES = ["on", "off"];

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function validateStatus(d, now = Date.now()) {
  const ok =
    d &&
    Number.isFinite(d.level_percent) && d.level_percent >= 0 && d.level_percent <= 100 &&
    PUMP_STATES.includes(d.pump_state) &&
    typeof d.last_seen === "string" && !Number.isNaN(Date.parse(d.last_seen));
  if (!ok) throw new ApiError("MALFORMED", "Invalid status payload");

  return {
    ...d,
    stale: now - Date.parse(d.last_seen) > STALE_MS,
    anomaly: d.level_percent < 20 && d.pump_state === "off",
  };
}

export function createClient(baseUrl, fetchFn = fetch) {
  let token = null;

  async function request(path, options) {
    let res;
    try {
      res = await fetchFn(baseUrl + path, options);
    } catch {
      throw new ApiError("NETWORK", "Network unreachable");
    }
    if (res.status === 401) throw new ApiError("UNAUTHORIZED", "Invalid or expired token");
    if (res.status === 404) throw new ApiError("NOT_FOUND", "Device not found");
    if (!res.ok) throw new ApiError("SERVER", `Server error ${res.status}`);
    try {
      return await res.json();
    } catch {
      throw new ApiError("MALFORMED", "Response is not valid JSON");
    }
  }

  async function login(username, password) {
    const data = await request("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!data || typeof data.token !== "string" || !data.token) {
      throw new ApiError("MALFORMED", "Token missing in login response");
    }
    token = data.token;
    return token;
  }

  async function getStatus(deviceId, now = Date.now()) {
    const data = await request(`/device/${deviceId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return validateStatus(data, now);
  }

  return { login, getStatus };
}