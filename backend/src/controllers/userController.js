import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

// @desc    Get user profile and settings
// @route   GET /api/users/me
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      theme: user.theme,
      dateFormat: user.dateFormat,
      role: user.role,
    },
  });
});

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
export const updateSettings = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    currency: req.body.currency,
    theme: req.body.theme,
    dateFormat: req.body.dateFormat,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: {
      currency: user.currency,
      theme: user.theme,
      dateFormat: user.dateFormat,
    },
  });
});

// @desc    Export user transactions as CSV
// @route   GET /api/users/export
// @access  Private
export const exportTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({
    date: -1,
  });

  // Build CSV
  const headers = [
    "Title",
    "Type",
    "Category",
    "Amount",
    "Date",
    "Payment Method",
    "Description",
    "Notes",
  ];

  const rows = transactions.map((t) => [
    t.title,
    t.type,
    t.category,
    t.amount,
    t.date,
    t.paymentMethod,
    t.description || "",
    t.notes || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=rupeeflow_transactions_${new Date().toISOString().split("T")[0]}.csv`
  );
  res.status(200).send(csv);
});
