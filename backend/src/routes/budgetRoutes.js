import express from "express";
import { param, query, body } from "express-validator";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
router.get(
  "/",
  [
    query("month").optional().isInt({ min: 0, max: 11 }),
    query("year").optional().isInt({ min: 2000, max: 2100 }),
  ],
  validate,
  getBudgets
);

// @desc    Create budget
// @route   POST /api/budgets
// @access  Private
router.post(
  "/",
  [
    body("category").notEmpty().withMessage("Category is required"),
    body("month").isInt({ min: 0, max: 11 }).withMessage("Month must be 0-11"),
    body("year").isInt({ min: 2000, max: 2100 }).withMessage("Valid year required"),
    body("limit")
      .isNumeric()
      .withMessage("Limit must be a number"),
  ],
  validate,
  createBudget
);

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
router.put(
  "/:id",
  [param("id").notEmpty().withMessage("Budget ID is required")],
  validate,
  updateBudget
);

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
router.delete(
  "/:id",
  [param("id").notEmpty().withMessage("Budget ID is required")],
  validate,
  deleteBudget
);

export default router;
