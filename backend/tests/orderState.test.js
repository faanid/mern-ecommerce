import test from "node:test";
import assert from "node:assert/strict";
import { getDeliveryError } from "../utils/orderState.js";

test("an unpaid order cannot be marked as delivered", () => {
  const error = getDeliveryError({ isPaid: false, isDelivered: false });

  assert.equal(
    error,
    "Order must be paid before it can be marked as delivered"
  );
});

test("a paid order can proceed to delivery", () => {
  assert.equal(getDeliveryError({ isPaid: true, isDelivered: false }), null);
});

test("delivery validation requires an explicitly paid order", () => {
  assert.equal(getDeliveryError({ isDelivered: false }), "Order must be paid before it can be marked as delivered");
});
