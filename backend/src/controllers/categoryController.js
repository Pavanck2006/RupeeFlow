import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

// Default categories to seed
const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", type: "income", color: "#22c55e", icon: "Wallet", isDefault: true },
  { name: "Freelance", type: "income", color: "#3b82f6", icon: "Briefcase", isDefault: true },
  { name: "Business", type: "income", color: "#8b5cf6", icon: "Building2", isDefault: true },
  { name: "Investment", type: "income", color: "#f59e0b", icon: "TrendingUp", isDefault: true },
  { name: "Other Income", type: "income", color: "#64748b", icon: "PlusCircle", isDefault: true },
];

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food", type: "expense", color: "#ef4444", icon: "Utensils", isDefault: true },
  { name: "Shopping", type: "expense", color: "#ec4899", icon: "ShoppingBag", isDefault: true },
  { name: "Transport", type: "expense", color: "#06b6d4", icon: "Car", isDefault: true },
  { name: "Rent", type: "expense", color: "#8b5cf6", icon: "Home", isDefault: true },
  { name: "Bills", type: "expense", color: "#f59e0b", icon: "FileText", isDefault: true },
  { name: "Healthcare", type: "expense", color: "#10b981", icon: "HeartPulse", isDefault: true },
  { name: "Education", type: "expense", color: "#3b82f6", icon: "GraduationCap", isDefault: true },
  { name: "Entertainment", type: "expense", color: "#a855f7", icon: "Film", isDefault: true },
  { name: "Travel", type: "expense", color: "#14b8a6", icon: "Plane", isDefault: true },
  { name: "Other Expenses", type: "expense", color: "#64748b", icon: "MoreHorizontal", isDefault: true },
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(async (req, res) => {
  // Get default categories plus user's custom categories
  const categories = await Category.find({
    $or: [{ isDefault: true }, { user: req.user.id }],
  }).sort({ type: 1, name: 1 });

  // Group by type
  const income = categories
    .filter((c) => c.type === "income")
    .map((c) => c.toJSON());
  const expense = categories
    .filter((c) => c.type === "expense")
    .map((c) => c.toJSON());

  res.status(200).json({
    success: true,
    data: { income, expense },
  });
});

// @desc    Seed default categories (for new users)
// @route   POST /api/categories/seed
// @access  Private
export const seedCategories = asyncHandler(async (req, res) => {
  const allDefaults = [...DEFAULT_INCOME_CATEGORIES, ...DEFAULT_EXPENSE_CATEGORIES];

  const created = await Category.insertMany(
    allDefaults.map((cat) => ({ ...cat, user: req.user.id }))
  );

  res.status(201).json({
    success: true,
    count: created.length,
    data: created.map((c) => c.toJSON()),
  });
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(async (req, res) => {
  // Add user to request body
  req.body.user = req.user.id;
  req.body.isDefault = false;

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category.toJSON(),
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: "Category not found",
    });
  }

  // Make sure user owns the category (or it's a default they can't modify)
  if (category.isDefault && category.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to update this category",
    });
  }

  if (!category.isDefault && category.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to update this category",
    });
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category.toJSON(),
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      error: "Category not found",
    });
  }

  // Only allow deleting custom categories owned by the user
  if (!category.isDefault && category.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to delete this category",
    });
  }

  if (category.isDefault) {
    return res.status(400).json({
      success: false,
      error: "Cannot delete default categories",
    });
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: { id: category.id },
  });
});
