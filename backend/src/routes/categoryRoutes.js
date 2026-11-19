import express from "express";
import { param, body } from "express-validator";
import {
  getCategories,
  seedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
router.get("/", getCategories);

// @desc    Seed default categories
// @route   POST /api/categories/seed
// @access  Private
router.post("/seed", seedCategories);

// @desc    Create category
// @route   POST /api/categories
// @access  Private
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Category name is required"),
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense"),
  ],
  validate,
  createCategory
);

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
router.put(
  "/:id",
  [param("id").notEmpty().withMessage("Category ID is required")],
  validate,
  updateCategory
);

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete(
  "/:id",
  [param("id").notEmpty().withMessage("Category ID is required")],
  validate,
  deleteCategory
);

export default router;
