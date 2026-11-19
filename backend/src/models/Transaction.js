/**
 * Transaction model - In-memory implementation
 */
import { db, generateId, chainable } from "../config/db.js";

class Transaction {
  constructor(data) {
    this._id = data._id || generateId();
    this.user = data.user;
    this.title = data.title;
    this.amount = typeof data.amount === "string" ? parseFloat(data.amount) : data.amount;
    this.type = data.type;
    this.category = data.category;
    this.date = data.date instanceof Date ? data.date : new Date(data.date);
    this.paymentMethod = data.paymentMethod;
    this.description = data.description || "";
    this.notes = data.notes || "";
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
      title: this.title,
      amount: this.amount,
      type: this.type,
      category: this.category,
      date: this.date.toISOString(),
      paymentMethod: this.paymentMethod,
      description: this.description,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  async deleteOne() {
    db.transactions.deleteOne(this._id);
  }

  static find(filter = {}) {
    const raws = db.transactions.find(filter);
    return chainable(raws.map((r) => new Transaction(r)));
  }

  static async findById(id) {
    const raw = db.transactions.findById(id);
    if (!raw) return null;
    return new Transaction(raw);
  }

  static async create(data) {
    const raw = db.transactions.create(data);
    return new Transaction(raw);
  }

  static async findByIdAndUpdate(id, updates, _options) {
    const raw = db.transactions.findByIdAndUpdate(id, updates);
    if (!raw) return null;
    return new Transaction(raw);
  }

  static async countDocuments(filter = {}) {
    return db.transactions.countDocuments(filter);
  }

  // Minimal aggregate support for budget spending calculation
  static async aggregate(pipeline) {
    const matchStage = pipeline.find((s) => s.$match);
    const groupStage = pipeline.find((s) => s.$group);

    if (!matchStage || !groupStage) return [];

    const filter = matchStage.$match;
    const raws = db.transactions.find({});

    // Manual filter for aggregate
    const matched = raws.filter((t) => {
      if (filter.user && t.user !== filter.user) return false;
      if (filter.type && t.type !== filter.type) return false;
      if (filter.category && t.category !== filter.category) return false;
      if (filter.date) {
        const d = t.date instanceof Date ? t.date : new Date(t.date);
        if (filter.date.$gte && d < new Date(filter.date.$gte)) return false;
        if (filter.date.$lte && d > new Date(filter.date.$lte)) return false;
      }
      return true;
    });

    if (matched.length === 0) return [];

    const total = matched.reduce((sum, t) => sum + (t.amount || 0), 0);
    return [{ _id: null, total }];
  }
}

export default Transaction;
