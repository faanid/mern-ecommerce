import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../modules/userModel.js";
import { isValidEmail } from "../utils/validation.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/",
};

const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
});

export const createUserController = ({ UserModel = User } = {}) => {
  // @route POST /api/users/login
  const authUser = asyncHandler(async (req, res) => {
    const email = (typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "");
    const password = req.body.password;

    if (!email || typeof password !== "string" || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.cookie("jwt", createToken(user._id.toString()), COOKIE_OPTIONS);
    res.json(toPublicUser(user));
  });

  // @route POST /api/users
  const registerUser = asyncHandler(async (req, res) => {
    const name = String(req.body.name || "").trim();
    const email = (typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "");
    const password = req.body.password;

    if (!name || !email || typeof password !== "string") {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }
    if (password.length < 8) {
      res.status(400);
      throw new Error("Password must be at least 8 characters long");
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await UserModel.create({ name, email, password: hashedPassword });

    res.cookie("jwt", createToken(user._id.toString()), COOKIE_OPTIONS);
    res.status(201).json(toPublicUser(user));
  });

  // @route POST /api/users/logout
  const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.status(200).json({ message: "Logged out successfully" });
  });

  // @route GET /api/users/profile
  const getUserProfile = asyncHandler(async (req, res) => {
    res.json(toPublicUser(req.user));
  });

  // @route PUT /api/users/profile
  const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        res.status(400);
        throw new Error("Name cannot be empty");
      }
      user.name = name;
    }

    if (req.body.email !== undefined) {
      const email = (typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "");
      if (!isValidEmail(email)) {
        res.status(400);
        throw new Error("Please provide a valid email address");
      }
      const emailOwner = await UserModel.findOne({ email, _id: { $ne: user._id } });
      if (emailOwner) {
        res.status(409);
        throw new Error("An account with this email already exists");
      }
      user.email = email;
    }

    if (req.body.password !== undefined) {
      if (typeof req.body.password !== "string" || req.body.password.length < 8) {
        res.status(400);
        throw new Error("Password must be at least 8 characters long");
      }
      user.password = await bcrypt.hash(req.body.password, 12);
    }

    const updatedUser = await user.save();
    res.json(toPublicUser(updatedUser));
  });

  // @route GET /api/users
  const getUsers = asyncHandler(async (req, res) => {
    const users = await UserModel.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  });

  // @route GET /api/users/:id
  const getUserByID = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  });

  // @route DELETE /api/users/:id
  const deleteUser = asyncHandler(async (req, res) => {
    if (req.user._id.toString() === req.params.id) {
      res.status(400);
      throw new Error("Administrators cannot delete their own account here");
    }

    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await user.deleteOne();
    res.json({ message: "User removed" });
  });

  // @route PUT /api/users/:id
  const updateUser = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        res.status(400);
        throw new Error("Name cannot be empty");
      }
      user.name = name;
    }
    if (req.body.email !== undefined) {
      const email = (typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "");
      if (!isValidEmail(email)) {
        res.status(400);
        throw new Error("Please provide a valid email address");
      }
      const emailOwner = await UserModel.findOne({ email, _id: { $ne: user._id } });
      if (emailOwner) {
        res.status(409);
        throw new Error("An account with this email already exists");
      }
      user.email = email;
    }
    if (req.body.isAdmin !== undefined) {
      if (typeof req.body.isAdmin !== "boolean") {
        res.status(400);
        throw new Error("isAdmin must be a boolean");
      }
      user.isAdmin = req.body.isAdmin;
    }

    const updatedUser = await user.save();
    res.json(toPublicUser(updatedUser));
  });

  return {
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
};

const {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserByID,
  updateUser,
} = createUserController();

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