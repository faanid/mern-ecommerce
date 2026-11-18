import { PRODUCTS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({ url: PRODUCTS_URL }),
      providesTags: (result = []) => [
        { type: "Product", id: "LIST" },
        ...result.map(({ _id }) => ({ type: "Product", id: _id })),
      ],
      keepUnusedDataFor: 5,
    }),
    getProductDetails: builder.query({
      query: (productId) => ({ url: `${PRODUCTS_URL}/${productId}` }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: () => ({ url: PRODUCTS_URL, method: "POST" }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    updateProduct: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `${PRODUCTS_URL}/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
