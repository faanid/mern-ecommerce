const PRODUCT_STRING_FIELDS = ["name", "image", "brand", "category", "description"];

export const validateProductFields = (input, { partial = false } = {}) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { data: null, error: "Product details must be an object" };
  }

  const data = {};
  for (const field of PRODUCT_STRING_FIELDS) {
    if (input[field] === undefined && partial) continue;
    if (typeof input[field] !== "string" || !input[field].trim()) {
      return { data: null, error: `${field} must be a non-empty string` };
    }
    data[field] = input[field].trim();
  }

  for (const field of ["price", "countInStock"]) {
    if (input[field] === undefined && partial) continue;
    const value = input[field];
    if (
      value === null ||
      value === "" ||
      (typeof value !== "number" && typeof value !== "string") ||
      !Number.isFinite(Number(value)) ||
      Number(value) < 0 ||
      (field === "countInStock" && !Number.isInteger(Number(value)))
    ) {
      return { data: null, error: `${field} must be a valid non-negative ${field === "price" ? "number" : "integer"}` };
    }
    data[field] = Number(value);
  }

  return { data, error: null };
};

export const normalizeOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return { items: null, error: "An order must contain between 1 and 50 items" };
  }

  const quantities = new Map();
  for (const item of items) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.product !== "string" ||
      !item.product ||
      !Number.isSafeInteger(item.qty) ||
      item.qty < 1
    ) {
      return { items: null, error: "Each order item must have a product ID and a positive integer quantity" };
    }
    quantities.set(item.product, (quantities.get(item.product) || 0) + item.qty);
  }

  if ([...quantities.values()].some((qty) => !Number.isSafeInteger(qty))) {
    return { items: null, error: "Order quantity is too large" };
  }

  return {
    items: [...quantities].map(([product, qty]) => ({ product, qty })),
    error: null,
  };
};


const EMAIL_LOCAL_PART_REGEX = /^[A-Z0-9!#$%&'*+/=?^_\x60{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_\x60{|}~-]+)*$/i;

export const isValidEmail = (email) => {
  if (typeof email !== "string") return false;

  const normalizedEmail = email.trim();
  if (!normalizedEmail || normalizedEmail.length > 254) return false;

  const atIndex = normalizedEmail.lastIndexOf("@");
  if (atIndex <= 0 || atIndex !== normalizedEmail.indexOf("@")) return false;

  const localPart = normalizedEmail.slice(0, atIndex);
  const domain = normalizedEmail.slice(atIndex + 1);

  if (localPart.length > 64 || !EMAIL_LOCAL_PART_REGEX.test(localPart)) {
    return false;
  }

  const domainLabels = domain.split(".");
  if (domainLabels.length < 2) return false;

  return domainLabels.every((label, index) => {
    if (
      label.length < 1 ||
      label.length > 63 ||
      !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
    ) {
      return false;
    }

    return index !== domainLabels.length - 1 || label.length >= 2;
  });
};
