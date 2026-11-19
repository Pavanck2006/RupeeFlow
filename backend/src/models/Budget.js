/**
 * Budget model - In-memory implementation
 */
import { db, generateId, chainable } from "../config/db.js";

class Budget {
  constructor(data) {
    this._id = data._id || generateId();
    this.user = data.user;
    this.category = data.category;
    this.month = typeof data.month === "string" ? parseInt(data.month, 10) : data.month;
    this.year = typeof data.year === "string" ? parseInt(data.year, 10) : data.year;
    this.limit = typeof data.limit === "string" ? parseFloat(data.limit) : data.limit;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  get id() {
    return this._id;
  }

  toJSON() {
    return {
      id: this._id,
      user: this.user,
      category: this.category,
      month: this.month,
      year: this.year,
      limit: this.limit,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  async deleteOne() {
    db.budgets.deleteOne(this._id);
  }

  static find(filter = {}) {
    const raws = db.budgets.find(filter);
    return chainable(raws.map((r) => new Budget(r)));
  }

  static async findById(id) {
    const raw = db.budgets.findById(id);
    if (!raw) return null;
    return new Budget(raw);
  }

  static async create(data) {
    const raw = db.budgets.create(data);
    return new Budget(raw);
  }

  static async findByIdAndUpdate(id, updates, _options) {
    const raw = db.budgets.findByIdAndUpdate(id, updates);
    if (!raw) return null;
    return new Budget(raw);
  }
}

export default Budget;
