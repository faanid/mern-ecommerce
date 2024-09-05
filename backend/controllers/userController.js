import asyncHandler from "../middleware/asyncHandler";
import User from "../modules/userModel";

// @desc Auth user & get token
// @route POST/api/users/login
// @access Public

const authUser = asyncHandler(async (req, res) => {
  res.send("auth user");
});

// @desc Register user
// @route POST/api/users
// @access Public

const registerUser = asyncHandler(async (req, res) => {
  res.send("register user");
});

// @desc Logout user / clear cookie
// @route POST/api/users/logout
// @access Private

const logoutUser = asyncHandler(async (req, res) => {
  res.send("logout user");
});

// @desc Get user profile
// @route GET/api/users/profile
// @access Private

const getUserProfile = asyncHandler(async (req, res) => {
  res.send("get user profile");
});

// @desc Update user Profile
// @route PUT/api/users/profile
// @access Private/Admin

const updateUserProfile = asyncHandler(async (req, res) => {
  res.send("update user profile");
});

// @desc Get users
// @route GET/api/users
// @access Private/Admin

const getUsers = asyncHandler(async (req, res) => {
  res.send("get user");
});

// @desc Get users by ID
// @route GET/api/users/:id
// @access Private/Admin

const getUserByID = asyncHandler(async (req, res) => {
  res.send("get user bt id");
});

// @desc Delete user
// @route DELETE/api/users/:id
// @access Private/Admin

const deleteUser = asyncHandler(async (req, res) => {
  res.send("delete user");
});

// @desc Update user
// @route PUT/api/users/:id
// @access Private/Admin

const updateUser = asyncHandler(async (req, res) => {
  res.send("update user");
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserByID,
  updateUser,
};
