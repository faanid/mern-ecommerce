import test from "node:test";
import assert from "node:assert/strict";
import { validateProductFields, normalizeOrderItems } from "../utils/validation.js";

test("product validation trims strings and normalizes numeric fields", () => {
  const result = validateProductFields({
    name: "  Keyboard ",
    image: " image.png ",
    brand: " Brand ",
    category: " Accessories ",
    description: " Description ",
    price: "19.99",
    countInStock: "4",
  });
  assert.equal(result.error, null);
  assert.equal(result.data.name, "Keyboard");
  assert.equal(result.data.price, 19.99);
  assert.equal(result.data.countInStock, 4);
});

test("product validation rejects invalid prices and fractional stock", () => {
  assert.ok(validateProductFields({ price: -1 }, { partial: true }).error);
  assert.ok(validateProductFields({ price: "" }, { partial: true }).error);
  assert.ok(validateProductFields({ countInStock: 1.5 }, { partial: true }).error);
  assert.ok(validateProductFields({ name: " " }, { partial: true }).error);
});

test("partial product updates allow only supplied valid fields", () => {
  assert.deepEqual(validateProductFields({ price: "12" }, { partial: true }), {
    data: { price: 12 },
    error: null,
  });
});

test("order items aggregate duplicate product IDs before stock checks", () => {
  assert.deepEqual(normalizeOrderItems([
    { product: "abc", qty: 2 },
    { product: "def", qty: 1 },
    { product: "abc", qty: 3 },
  ]), {
    items: [{ product: "abc", qty: 5 }, { product: "def", qty: 1 }],
    error: null,
  });
});

test("order validation rejects string, fractional, zero, and excessive quantities", () => {
  for (const qty of ["2", 1.5, 0, -1, Number.MAX_SAFE_INTEGER + 1]) {
    assert.ok(normalizeOrderItems([{ product: "abc", qty }]).error);
  }
});

test("order validation rejects empty and oversized item arrays", () => {
  assert.ok(normalizeOrderItems([]).error);
  assert.ok(normalizeOrderItems(Array.from({ length: 51 }, (_, i) => ({
    product: String(i), qty: 1,
  }))).error);
});
