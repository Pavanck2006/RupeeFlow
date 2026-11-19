import express from "express";
import { param, query, body } from "express-validator";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("type").optional().isIn(["all", "income", "expense"]),
    query("dateFrom").optional().isISO8601(),
    query("dateTo").optional().isISO8601(),
  ],
  validate,
  getTransactions
);

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Transaction ID is required")],
  validate,
  getTransaction
);

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("amount")
      .isNumeric()
      .withMessage("Amount must be a number"),
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
    body("category").notEmpty().withMessage("Category is required"),
    body("date").notEmpty().withMessage("Date is required"),
    body("paymentMethod").notEmpty().withMessage("Payment method is required"),
  ],
  validate,
  createTransaction
);

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
router.put(
  "/:id",
  [param("id").notEmpty().withMessage("Transaction ID is required")],
  validate,
  updateTransaction
);

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
router.delete(
  "/:id",
  [param("id").notEmpty().withMessage("Transaction ID is required")],
  validate,
  deleteTransaction
);

export default router;
