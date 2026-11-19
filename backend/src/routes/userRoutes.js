import express from "express";
import {
  getProfile,
  updateSettings,
  exportTransactions,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get user profile and settings
// @route   GET /api/users/me
// @access  Private
router.get("/me", getProfile);

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
router.put("/settings", updateSettings);

// @desc    Export transactions as CSV
// @route   GET /api/users/export
// @access  Private
router.get("/export", exportTransactions);

export default router;
