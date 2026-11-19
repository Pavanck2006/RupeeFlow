import express from "express";
import { query } from "express-validator";
import {
  getDailyReport,
  getMonthlyReport,
  getYearlyReport,
  exportYearlyExcel,
  exportYearlyPDF,
  exportMonthlyExcel,
  exportMonthlyPDF,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Get daily report
// @route   GET /api/reports/daily
// @access  Private
router.get(
  "/daily",
  [query("date").notEmpty().withMessage("Date is required (YYYY-MM-DD)")],
  validate,
  getDailyReport
);

// @desc    Get monthly report
// @route   GET /api/reports/monthly
// @access  Private
router.get(
  "/monthly",
  [
    query("year").optional().isInt({ min: 2000, max: 2100 }),
    query("month").optional().isInt({ min: 0, max: 11 }),
  ],
  validate,
  getMonthlyReport
);

// @desc    Get yearly report
// @route   GET /api/reports/yearly
// @access  Private
router.get(
  "/yearly",
  [query("year").optional().isInt({ min: 2000, max: 2100 })],
  validate,
  getYearlyReport
);

// @desc    Export yearly report to Excel
// @route   GET /api/reports/export/yearly/excel
// @access  Private
router.get(
  "/export/yearly/excel",
  [query("year").optional().isInt({ min: 2000, max: 2100 })],
  validate,
  exportYearlyExcel
);

// @desc    Export yearly report to PDF
// @route   GET /api/reports/export/yearly/pdf
// @access  Private
router.get(
  "/export/yearly/pdf",
  [query("year").optional().isInt({ min: 2000, max: 2100 })],
  validate,
  exportYearlyPDF
);

// @desc    Export monthly report to Excel
// @route   GET /api/reports/export/monthly/excel
// @access  Private
router.get(
  "/export/monthly/excel",
  [
    query("year").optional().isInt({ min: 2000, max: 2100 }),
    query("month").optional().isInt({ min: 0, max: 11 }),
  ],
  validate,
  exportMonthlyExcel
);

// @desc    Export monthly report to PDF
// @route   GET /api/reports/export/monthly/pdf
// @access  Private
router.get(
  "/export/monthly/pdf",
  [
    query("year").optional().isInt({ min: 2000, max: 2100 }),
    query("month").optional().isInt({ min: 0, max: 11 }),
  ],
  validate,
  exportMonthlyPDF
);

export default router;
