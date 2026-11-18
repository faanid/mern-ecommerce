import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../modules/userModel.js";

// Protect routes using the HTTP-only JWT cookie.
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }

  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("Not authorized, user no longer exists");
  }

  req.user = user;
  next();
});

// Restrict routes to administrator accounts.
export const admin = (req, res, next) => {
  if (req.user?.isAdmin) {
    return next();
  }

  res.status(403);
  return next(new Error("Not authorized as an administrator"));
};
