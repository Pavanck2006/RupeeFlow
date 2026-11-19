import asyncHandler from "express-async-handler";
import Transaction from "../models/Transaction.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

/**
 * Helper: Get start and end of a day in Asia/Kolkata timezone (UTC+5:30)
 * Returns UTC Date objects for MongoDB querying
 */
const getDayBoundariesIST = (dateStr) => {
  // Parse YYYY-MM-DD
  const [year, month, day] = dateStr.split("-").map(Number);
  // Create date in IST: IST is UTC+5:30
  // To get start of day in IST, we create a date at 18:30 UTC of previous day
  // because midnight IST = 18:30 UTC previous day
  const startIST = new Date(Date.UTC(year, month - 1, day, 18, 30, 0)); // 18:30 UTC = 00:00 IST
  const endIST = new Date(Date.UTC(year, month - 1, day, 18, 29, 59)); // end of day IST
  return { start: startIST, end: endIST };
};

/**
 * Helper: Get month boundaries in Asia/Kolkata timezone
 */
const getMonthBoundariesIST = (year, month) => {
  // month is 0-11
  const startIST = new Date(Date.UTC(year, month, 1, 18, 30, 0)); // 1st midnight IST
  const endIST = new Date(Date.UTC(year, month + 1, 0, 18, 29, 59)); // last day end IST
  return { start: startIST, end: endIST };
};

/**
 * Helper: Get year boundaries in Asia/Kolkata timezone
 */
const getYearBoundariesIST = (year) => {
  const startIST = new Date(Date.UTC(year, 0, 1, 18, 30, 0)); // Jan 1 midnight IST
  const endIST = new Date(Date.UTC(year + 1, 0, 0, 18, 29, 59)); // Dec 31 end IST
  return { start: startIST, end: endIST };
};

// @desc    Get daily report
// @route   GET /api/reports/daily
// @access  Private
export const getDailyReport = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      error: "Date parameter is required (YYYY-MM-DD)",
    });
  }

  const { start, end } = getDayBoundariesIST(date);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  const dailyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const dailyExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      date,
      income: dailyIncome,
      expense: dailyExpense,
      balance: dailyIncome - dailyExpense,
      savings: dailyIncome - dailyExpense,
      transactions: transactions.map((t) => t.toJSON()),
    },
  });
});

// @desc    Get monthly report
// @route   GET /api/reports/monthly
// @access  Private
export const getMonthlyReport = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
  const monthNum = month !== undefined ? parseInt(month, 10) : new Date().getMonth();

  const { start, end } = getMonthBoundariesIST(yearNum, monthNum);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  const monthlyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Category-wise expenses
  const categoryExpense = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    });

  // Category-wise income
  const categoryIncome = {};
  transactions
    .filter((t) => t.type === "income")
    .forEach((t) => {
      categoryIncome[t.category] = (categoryIncome[t.category] || 0) + t.amount;
    });

  const savings = monthlyIncome - monthlyExpense;

  // Previous month comparison
  const prevMonth = monthNum === 0 ? 11 : monthNum - 1;
  const prevYear = monthNum === 0 ? yearNum - 1 : yearNum;
  const { start: prevStart, end: prevEnd } = getMonthBoundariesIST(prevYear, prevMonth);

  const prevTransactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: prevStart, $lte: prevEnd },
  });

  const prevIncome = prevTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const prevExpense = prevTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  res.status(200).json({
    success: true,
    data: {
      year: yearNum,
      month: monthNum,
      income: monthlyIncome,
      expense: monthlyExpense,
      balance: monthlyIncome - monthlyExpense,
      savings,
      categoryExpense: Object.entries(categoryExpense).map(([category, amount]) => ({
        category,
        amount,
      })),
      categoryIncome: Object.entries(categoryIncome).map(([category, amount]) => ({
        category,
        amount,
      })),
      previousMonth: {
        income: prevIncome,
        expense: prevExpense,
        balance: prevIncome - prevExpense,
      },
      transactions: transactions.map((t) => t.toJSON()),
    },
  });
});

// @desc    Get yearly report
// @route   GET /api/reports/yearly
// @access  Private
export const getYearlyReport = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();

  const { start, end } = getYearBoundariesIST(yearNum);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  // Monthly breakdown (Jan-Dec)
  const monthlyBreakdown = [];
  for (let m = 0; m < 12; m += 1) {
    const monthStart = new Date(Date.UTC(yearNum, m, 1, 18, 30, 0));
    const monthEnd = new Date(Date.UTC(yearNum, m + 1, 0, 18, 29, 59));

    const monthTransactions = transactions.filter(
      (t) => new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    );

    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyBreakdown.push({
      month: m,
      income,
      expense,
      balance: income - expense,
    });
  }

  const annualIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const annualExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Category-wise yearly expenses
  const categoryExpense = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryExpense[t.category] = (categoryExpense[t.category] || 0) + t.amount;
    });

  const annualSavings = annualIncome - annualExpense;

  res.status(200).json({
    success: true,
    data: {
      year: yearNum,
      income: annualIncome,
      expense: annualExpense,
      balance: annualSavings,
      savings: annualSavings,
      monthlyBreakdown,
      categoryExpense: Object.entries(categoryExpense).map(([category, amount]) => ({
        category,
        amount,
      })),
      transactions: transactions.map((t) => t.toJSON()),
    },
  });
});

// @desc    Export yearly report to Excel
// @route   GET /api/reports/export/yearly/excel
// @access  Private
export const exportYearlyExcel = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();

  const { start, end } = getYearBoundariesIST(yearNum);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Yearly Report ${yearNum}`);

  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Type", key: "type", width: 12 },
    { header: "Category", key: "category", width: 20 },
    { header: "Payment Method", key: "paymentMethod", width: 20 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Description", key: "description", width: 40 },
  ];

  transactions.forEach((t) => {
    worksheet.addRow({
      date: t.date.toISOString().split("T")[0],
      type: t.type,
      category: t.category,
      paymentMethod: t.paymentMethod,
      amount: t.amount,
      description: t.description || "",
    });
  });

  worksheet.addRow({});
  worksheet.addRow({
    date: "Total",
    type: "",
    category: "",
    paymentMethod: "",
    amount: transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0) -
      transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=rupeeflow-yearly-${yearNum}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export yearly report to PDF
// @route   GET /api/reports/export/yearly/pdf
// @access  Private
export const exportYearlyPDF = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();

  const { start, end } = getYearBoundariesIST(yearNum);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const annualIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const annualExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const annualSavings = annualIncome - annualExpense;

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=rupeeflow-yearly-${yearNum}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("RupeeFlow - Yearly Financial Report", { align: "center" });
  doc.fontSize(14).text(`Year: ${yearNum}`, { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Total Income: ${annualIncome}`);
  doc.text(`Total Expenses: ${annualExpense}`);
  doc.text(`Net Savings: ${annualSavings}`);
  doc.moveDown();

  doc.fontSize(12).text("Transactions:");
  doc.fontSize(10);

  transactions.forEach((t) => {
    const dateStr = new Date(t.date).toISOString().split("T")[0];
    doc.text(
      `${dateStr} | ${t.type.toUpperCase()} | ${t.category} | ${t.paymentMethod} | ${t.amount} | ${t.description || ""}`
    );
  });

  doc.end();
});

// @desc    Export monthly report to Excel
// @route   GET /api/reports/export/monthly/excel
// @access  Private
export const exportMonthlyExcel = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
  const monthNum = month !== undefined ? parseInt(month, 10) : new Date().getMonth();

  const { start, end } = getMonthBoundariesIST(yearNum, monthNum);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(
    `Monthly Report ${monthNames[monthNum]} ${yearNum}`
  );

  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Type", key: "type", width: 12 },
    { header: "Category", key: "category", width: 20 },
    { header: "Payment Method", key: "paymentMethod", width: 20 },
    { header: "Amount", key: "amount", width: 12 },
    { header: "Description", key: "description", width: 40 },
  ];

  transactions.forEach((t) => {
    worksheet.addRow({
      date: t.date.toISOString().split("T")[0],
      type: t.type,
      category: t.category,
      paymentMethod: t.paymentMethod,
      amount: t.amount,
      description: t.description || "",
    });
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=rupeeflow-monthly-${monthNames[monthNum]}-${yearNum}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export monthly report to PDF
// @route   GET /api/reports/export/monthly/pdf
// @access  Private
export const exportMonthlyPDF = asyncHandler(async (req, res) => {
  const { year, month } = req.query;

  const yearNum = year ? parseInt(year, 10) : new Date().getFullYear();
  const monthNum = month !== undefined ? parseInt(month, 10) : new Date().getMonth();

  const { start, end } = getMonthBoundariesIST(yearNum, monthNum);

  const transactions = await Transaction.find({
    user: req.user.id,
    date: { $gte: start, $lte: end },
  }).sort({ date: 1 });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const monthlyIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=rupeeflow-monthly-${monthNames[monthNum]}-${yearNum}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("RupeeFlow - Monthly Financial Report", { align: "center" });
  doc.fontSize(14).text(`${monthNames[monthNum]} ${yearNum}`, { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Total Income: ${monthlyIncome}`);
  doc.text(`Total Expenses: ${monthlyExpense}`);
  doc.text(`Net Savings: ${monthlyIncome - monthlyExpense}`);
  doc.moveDown();

  doc.fontSize(12).text("Transactions:");
  doc.fontSize(10);

  transactions.forEach((t) => {
    const dateStr = new Date(t.date).toISOString().split("T")[0];
    doc.text(
      `${dateStr} | ${t.type.toUpperCase()} | ${t.category} | ${t.paymentMethod} | ${t.amount} | ${t.description || ""}`
    );
  });

  doc.end();
});
