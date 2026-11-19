import test from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../middleware/rateLimiter.js";

const mockResponse = () => ({
  statusCode: 200,
  headers: {},
  body: null,
  setHeader(name, value) { this.headers[name] = value; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test("rate limiter allows requests within the configured window", () => {
  let time = 1_000;
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, now: () => time });
  const req = { ip: "test-client" };
  let nextCalls = 0;

  const first = mockResponse();
  limiter(req, first, () => nextCalls++);
  const second = mockResponse();
  limiter(req, second, () => nextCalls++);

  assert.equal(nextCalls, 2);
  assert.equal(second.headers["RateLimit-Remaining"], "0");
  time += 60_001;
  const third = mockResponse();
  limiter(req, third, () => nextCalls++);
  assert.equal(nextCalls, 3);
  assert.equal(third.statusCode, 200);
});

test("rate limiter blocks requests after the maximum and returns retry information", () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, now: () => 10_000 });
  const req = { ip: "limited-client" };
  const first = mockResponse();
  limiter(req, first, () => {});
  const second = mockResponse();
  let nextCalled = false;
  limiter(req, second, () => { nextCalled = true; });

  assert.equal(second.statusCode, 429);
  assert.equal(second.headers["Retry-After"], "60");
  assert.equal(nextCalled, false);
  assert.match(second.body.message, /Too many requests/);
});

test("separate rate limiter instances maintain independent counters for the same IP", () => {
  const now = () => 20_000;
  const loginLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 2, now });
  const registrationLimiter = createRateLimiter({ windowMs: 60 * 60_000, max: 1, now });
  const req = { ip: "shared-client" };

  const loginFirst = mockResponse();
  loginLimiter(req, loginFirst, () => {});
  const loginSecond = mockResponse();
  loginLimiter(req, loginSecond, () => {});
  const loginThird = mockResponse();
  loginLimiter(req, loginThird, () => {});

  assert.equal(loginThird.statusCode, 429);

  const registrationFirst = mockResponse();
  let registrationNextCalled = false;
  registrationLimiter(req, registrationFirst, () => { registrationNextCalled = true; });

  assert.equal(registrationFirst.statusCode, 200);
  assert.equal(registrationNextCalled, true);
  assert.equal(registrationFirst.headers["RateLimit-Remaining"], "0");
});
