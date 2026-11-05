# Test Plan: Device API

Assumptions: stale = last_seen older than 5 min; valid level = number 0 to 100;
pump_state is strictly "on" or "off"; anomaly = level < 20 and pump off.

| ID | Endpoint | Type | Scenario | Expected | Priority | Automated |
|----|----------|------|----------|----------|----------|-----------|
| TC01 | /login | Positive | Valid credentials | Token returned | High | Y |
| TC02 | /login | Negative | Wrong credentials | 401, UNAUTHORIZED | High | Y |
| TC03 | /login | Negative | 200 but no token | MALFORMED | Medium | Y |
| TC04 | /status | Positive | Valid token, fresh data | Status returned, bearer header sent | High | Y |
| TC05 | /status | Negative | Invalid or expired token | 401, UNAUTHORIZED | High | Y |
| TC06 | /status | Negative | Unknown device id | 404, NOT_FOUND | Medium | Y |
| TC07 | /status | Edge | last_seen older than 5 min | stale = true | High | Y |
| TC08 | /status | Edge | last_seen exactly 5 min | stale = false | Medium | Y |
| TC09 | /status | Negative | level 101, -5, null, "55"; bad pump_state; bad last_seen | MALFORMED | High | Y |
| TC10 | /status | Negative | Non-JSON body | MALFORMED | Medium | Y |
| TC11 | /status | Negative | Network failure or timeout | NETWORK | High | Y |
| TC12 | /status | Edge | level < 20 and pump off | anomaly = true | Medium | Y |
| TC13 | /status | Edge | Server 500 | SERVER error shown, no crash | Medium | N |
| TC14 | /status | Edge | Token expires mid-session | Re-login, retry once | Medium | N |