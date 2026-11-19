import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../utils/cartUtils";

const getInitialCartState = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return { cartItems: [] };

    const parsedCart = JSON.parse(savedCart);
    if (!parsedCart || !Array.isArray(parsedCart.cartItems)) {
      return { cartItems: [] };
    }

    return parsedCart;
  } catch {
    return { cartItems: [] };
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: getInitialCartState(),
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.cartItems.find((x) => x._id === item._id);

      if (existingItem) {
        state.cartItems = state.cartItems.map((x) =>
          x._id === item._id ? item : x
        );
      } else {
        state.cartItems.push(item);
      }

      return updateCart(state);
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      return updateCart(state);
    },
    clearCart: (state) => {
      state.cartItems = [];
      return updateCart(state);
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
