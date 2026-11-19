import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createServer } from "node:http";
import { createUserController } from "../controllers/userController.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const createHarness = async (t, { targetIsAdmin = true, adminCount = 1 } = {}) => {
  const calls = { countDocuments: 0, deleteOne: 0, save: 0 };
  const targetUser = {
    _id: "target-user",
    name: "Target User",
    email: "target@example.com",
    isAdmin: targetIsAdmin,
    save: async function () {
      calls.save += 1;
      return this;
    },
    deleteOne: async function () {
      calls.deleteOne += 1;
    },
  };

  const UserModel = {
    findById: async () => targetUser,
    countDocuments: async (filter) => {
      calls.countDocuments += 1;
      assert.deepEqual(filter, { isAdmin: true });
      return adminCount;
    },
  };

  const { deleteUser, updateUser } = createUserController({ UserModel });
  const app = express();
  app.use(express.json());
  app.delete("/api/users/:id", (req, res, next) => {
    req.user = { _id: "acting-admin", isAdmin: true };
    next();
  }, deleteUser);
  app.put("/api/users/:id", (req, res, next) => {
    req.user = { _id: "acting-admin", isAdmin: true };
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
    targetUser,
  };
};

const putJson = (url, body) => fetch(url, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

test("deleting the last administrator is rejected", async (t) => {
  const { baseUrl, calls } = await createHarness(t, { adminCount: 1 });
  const response = await fetch(`${baseUrl}/api/users/target-user`, {
    method: "DELETE",
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Cannot delete the last administrator");
  assert.equal(calls.countDocuments, 1);
  assert.equal(calls.deleteOne, 0);
});

test("deleting an administrator is allowed when another administrator exists", async (t) => {
  const { baseUrl, calls } = await createHarness(t, { adminCount: 2 });
  const response = await fetch(`${baseUrl}/api/users/target-user`, {
    method: "DELETE",
  });

  assert.equal(response.status, 200);
  assert.equal((await response.json()).message, "User removed");
  assert.equal(calls.countDocuments, 1);
  assert.equal(calls.deleteOne, 1);
});

test("demoting the last administrator is rejected", async (t) => {
  const { baseUrl, calls, targetUser } = await createHarness(t, { adminCount: 1 });
  const response = await putJson(`${baseUrl}/api/users/target-user`, {
    isAdmin: false,
  });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, "Cannot demote the last administrator");
  assert.equal(calls.countDocuments, 1);
  assert.equal(calls.save, 0);
  assert.equal(targetUser.isAdmin, true);
});

test("demoting an administrator is allowed when another administrator exists", async (t) => {
  const { baseUrl, calls, targetUser } = await createHarness(t, { adminCount: 2 });
  const response = await putJson(`${baseUrl}/api/users/target-user`, {
    isAdmin: false,
  });

  assert.equal(response.status, 200);
  assert.equal((await response.json()).isAdmin, false);
  assert.equal(calls.countDocuments, 1);
  assert.equal(calls.save, 1);
  assert.equal(targetUser.isAdmin, false);
});

test("deleting a non-administrator does not require an administrator count", async (t) => {
  const { baseUrl, calls } = await createHarness(t, {
    targetIsAdmin: false,
    adminCount: 1,
  });
  const response = await fetch(`${baseUrl}/api/users/target-user`, {
    method: "DELETE",
  });

  assert.equal(response.status, 200);
  assert.equal(calls.countDocuments, 0);
  assert.equal(calls.deleteOne, 1);
});
