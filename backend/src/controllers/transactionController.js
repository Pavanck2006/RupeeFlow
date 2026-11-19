import asyncHandler from "express-async-handler";
import Transaction from "../models/Transaction.js";

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    category,
    paymentMethod,
    dateFrom,
    dateTo,
    search,
    sort = "-date",
  } = req.query;

  // Build query - only transactions belonging to this user
  const query = { user: req.user.id };

  // Filter by type
  if (type && type !== "all") {
    query.type = type;
  }

  // Filter by category
  if (category && category !== "all") {
    query.category = category;
  }

  // Filter by payment method
  if (paymentMethod && paymentMethod !== "all") {
    query.paymentMethod = paymentMethod;
  }

  // Filter by date range
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) {
      query.date.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      query.date.$lte = new Date(dateTo);
    }
  }

  // Search in title, description, category, notes
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;

  const total = await Transaction.countDocuments(query);

  const transactions = await Transaction.find(query)
    .sort(sort)
    .skip(startIndex)
    .limit(limitNum);

  // Pagination result
  const pagination = {};
  if (startIndex < total) {
    pagination.next = { page: pageNum + 1, limit: limitNum };
  }
  if (startIndex > 0) {
    pagination.prev = { page: pageNum - 1, limit: limitNum };
  }

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    pagination,
    data: transactions.map((t) => t.toJSON()),
  });
});

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
export const getTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  // Make sure user owns the transaction
  if (transaction.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to access this transaction",
    });
  }

  res.status(200).json({
    success: true,
    data: transaction.toJSON(),
  });
});

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = asyncHandler(async (req, res) => {
  // Add user to request body
  req.body.user = req.user.id;

  const transaction = await Transaction.create(req.body);

  res.status(201).json({
    success: true,
    data: transaction.toJSON(),
  });
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  // Make sure user owns the transaction
  if (transaction.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to update this transaction",
    });
  }

  transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: transaction.toJSON(),
  });
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(404).json({
      success: false,
      error: "Transaction not found",
    });
  }

  // Make sure user owns the transaction
  if (transaction.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to delete this transaction",
    });
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    data: { id: transaction.id },
  });
});
