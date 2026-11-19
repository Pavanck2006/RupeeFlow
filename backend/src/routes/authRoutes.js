import express from "express";
import { body, param } from "express-validator";
import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Validation chains
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updatePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
];

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", registerValidation, validate, register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", loginValidation, validate, login);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, logout);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, getMe);

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
router.put("/updatedetails", protect, updateDetails);

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put("/updatepassword", protect, updatePasswordValidation, validate, updatePassword);

export default router;
