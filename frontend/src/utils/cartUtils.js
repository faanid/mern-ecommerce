export const addDecimals = (num) => {
  return (Math.round(Number(num) * 100) / 100).toFixed(2);
};

export const updateCart = (state) => {
  const itemsPrice = Number(
    state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  state.itemsPrice = addDecimals(itemsPrice);
  state.shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 10);
  state.taxPrice = addDecimals(itemsPrice * 0.15);
  state.totalPrice = addDecimals(
    itemsPrice + Number(state.shippingPrice) + Number(state.taxPrice)
  );

  try {
    localStorage.setItem("cart", JSON.stringify(state));
  } catch (error) {
    // The cart remains usable in memory if browser storage is unavailable.
    console.error("Unable to persist cart to local storage:", error);
  }

  return state;
};
