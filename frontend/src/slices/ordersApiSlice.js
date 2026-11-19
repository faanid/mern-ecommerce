import { ORDERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: ORDERS_URL,
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Order"],
    }),
    getOrderDetails: builder.query({
      query: (orderId) => `${ORDERS_URL}/${orderId}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    getMyOrders: builder.query({
      query: () => `${ORDERS_URL}/myorders`,
      providesTags: [{ type: "Order", id: "MY_ORDERS" }],
    }),
    getOrders: builder.query({
      query: () => ORDERS_URL,
      providesTags: (result = []) => [
        { type: "Order", id: "LIST" },
        ...result.map(({ _id }) => ({ type: "Order", id: _id })),
      ],
    }),
    markOrderAsPaid: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
        { type: "Order", id: "MY_ORDERS" },
      ],
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
        { type: "Order", id: "MY_ORDERS" },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useMarkOrderAsPaidMutation,
  useDeliverOrderMutation,
} = ordersApiSlice;
