import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: USERS_URL,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({ url: `${USERS_URL}/logout`, method: "POST" }),
      invalidatesTags: ["User"],
    }),
    getUserProfile: builder.query({
      query: () => `${USERS_URL}/profile`,
      providesTags: ["User"],
    }),
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    getUsers: builder.query({
      query: () => USERS_URL,
      providesTags: (result = []) => [
        { type: "User", id: "LIST" },
        ...result.map(({ _id }) => ({ type: "User", id: _id })),
      ],
    }),
    getUserDetails: builder.query({
      query: (userId) => `${USERS_URL}/${userId}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...body }) => ({
        url: `${USERS_URL}/${userId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} = usersApiSlice;
