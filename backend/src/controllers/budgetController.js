import asyncHandler from "express-async-handler";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

// @desc    Get all budgets for logged in user
// @route   GET /api/budgets
// @access  Private
export const getBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const query = { user: req.user.id };

  if (month !== undefined) {
    query.month = parseInt(month, 10);
  }
  if (year !== undefined) {
    query.year = parseInt(year, 10);
  }

  const budgets = await Budget.find(query).sort({ year: -1, month: -1, category: 1 });

  // Calculate spending for each budget
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      const budgetObj = budget.toJSON();
      const startDate = new Date(budget.year, budget.month, 1);
      const endDate = new Date(budget.year, budget.month + 1, 0);

      const spent = await Transaction.aggregate([
        {
          $match: {
            user: req.user.id,
            type: "expense",
            category: budget.category,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      budgetObj.spent = spent.length > 0 ? spent[0].total : 0;
      budgetObj.remaining = budget.limit - budgetObj.spent;
      budgetObj.utilization = budget.limit > 0 ? (budgetObj.spent / budget.limit) * 100 : 0;
      budgetObj.status =
        budgetObj.utilization >= 100 ? "exceeded" : budgetObj.utilization >= 80 ? "warning" : "ok";

      return budgetObj;
    })
  );

  res.status(200).json({
    success: true,
    count: budgetsWithSpending.length,
    data: budgetsWithSpending,
  });
});

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = asyncHandler(async (req, res) => {
  // Add user to request body
  req.body.user = req.user.id;

  const budget = await Budget.create(req.body);

  res.status(201).json({
    success: true,
    data: budget.toJSON(),
  });
});

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = asyncHandler(async (req, res, next) => {
  let budget = await Budget.findById(req.params.id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      error: "Budget not found",
    });
  }

  // Make sure user owns the budget
  if (budget.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to update this budget",
    });
  }

  budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: budget.toJSON(),
  });
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findById(req.params.id);

  if (!budget) {
    return res.status(404).json({
      success: false,
      error: "Budget not found",
    });
  }

  // Make sure user owns the budget
  if (budget.user !== req.user.id) {
    return res.status(401).json({
      success: false,
      error: "Not authorized to delete this budget",
    });
  }

  await budget.deleteOne();

  res.status(200).json({
    success: true,
    data: { id: budget.id },
  });
});
