import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createServer } from "node:http";
import { createUserController } from "../controllers/userController.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const createHarness = async (t) => {
  const calls = { findOne: 0, findById: 0, create: 0, save: 0 };
  const user = {
    _id: "user-123",
    name: "Test User",
    email: "existing@example.com",
    password: "hashed-password",
    isAdmin: false,
    matchPassword: async () => true,
    save: async function () {
      calls.save += 1;
      return this;
    },
  };

  const UserModel = {
    findOne() {
      calls.findOne += 1;
      const query = Promise.resolve(null);
      query.select = async () => user;
      return query;
    },
    findById: async () => {
      calls.findById += 1;
      return user;
    },
    create: async (data) => {
      calls.create += 1;
      Object.assign(user, data);
      return user;
    },
  };

  process.env.JWT_SECRET = "integration-test-secret";

  const {
    authUser,
    registerUser,
    updateUserProfile,
    updateUser,
  } = createUserController({ UserModel });

  const app = express();
  app.use(express.json());
  app.post("/api/users", registerUser);
  app.post("/api/users/login", authUser);
  app.put("/api/users/profile", (req, res, next) => {
    req.user = user;
    next();
  }, updateUserProfile);
  app.put("/api/users/:id", (req, res, next) => {
    req.user = { _id: "admin-123", isAdmin: true };
    next();
  }, updateUser);
  app.use(errorHandler);

  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    calls,
    user,
  };
};

const postJson = (url, body) => fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const putJson = (url, body) => fetch(url, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

test("registration rejects malformed email through the HTTP route", async (t) => {
  const { baseUrl, calls } = await createHarness(t);
  const response = await postJson(`${baseUrl}/api/users`, {
    name: "Test User",
    email: "not-an-email",
    password: "password123",
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Please provide a valid email address");
  assert.equal(calls.findOne, 0);
  assert.equal(calls.create, 0);
});

test("login rejects malformed email through the HTTP route", async (t) => {
  const { baseUrl, calls } = await createHarness(t);
  const response = await postJson(`${baseUrl}/api/users/login`, {
    email: "not-an-email",
    password: "password123",
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Please provide a valid email address");
  assert.equal(calls.findOne, 0);
});

test("profile update rejects malformed email through the HTTP route", async (t) => {
  const { baseUrl, calls } = await createHarness(t);
  const response = await putJson(`${baseUrl}/api/users/profile`, {
    email: "not-an-email",
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Please provide a valid email address");
  assert.equal(calls.findById, 1);
  assert.equal(calls.findOne, 0);
  assert.equal(calls.save, 0);
});

test("admin update rejects malformed email through the HTTP route", async (t) => {
  const { baseUrl, calls } = await createHarness(t);
  const response = await putJson(`${baseUrl}/api/users/user-123`, {
    email: "not-an-email",
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Please provide a valid email address");
  assert.equal(calls.findById, 1);
  assert.equal(calls.findOne, 0);
  assert.equal(calls.save, 0);
});

test("profile update trims and lowercases a valid email", async (t) => {
  const { baseUrl, user, calls } = await createHarness(t);
  const response = await putJson(`${baseUrl}/api/users/profile`, {
    email: "  NEW.USER@EXAMPLE.COM  ",
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.email, "new.user@example.com");
  assert.equal(user.email, "new.user@example.com");
  assert.equal(calls.save, 1);
});
