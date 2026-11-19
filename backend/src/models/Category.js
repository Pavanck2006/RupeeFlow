/**
 * Category model - In-memory implementation
 */
import { db, generateId, chainable } from "../config/db.js";

class Category {
  constructor(data) {
    this._id = data._id || generateId();
    this.user = data.user || null;
    this.name = data.name;
    this.type = data.type;
    this.color = data.color || "#64748b";
    this.icon = data.icon || "Tag";
    this.isDefault = data.isDefault || false;
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
      name: this.name,
      type: this.type,
      color: this.color,
      icon: this.icon,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  async deleteOne() {
    db.categories.deleteOne(this._id);
  }

  static find(filter = {}) {
    // Handle $or for categories (default + user-owned)
    if (filter.$or) {
      const all = db.categories.find({});
      const matched = all.filter((c) =>
        filter.$or.some((clause) => {
          for (const key of Object.keys(clause)) {
            if (c[key] !== clause[key]) return false;
          }
          return true;
        })
      );
      return chainable(matched.map((r) => new Category(r)));
    }
    const raws = db.categories.find(filter);
    return chainable(raws.map((r) => new Category(r)));
  }

  static async findById(id) {
    const raw = db.categories.findById(id);
    if (!raw) return null;
    return new Category(raw);
  }

  static async create(data) {
    const raw = db.categories.create(data);
    return new Category(raw);
  }

  static async insertMany(items) {
    return items.map((item) => {
      const raw = db.categories.create(item);
      return new Category(raw);
    });
  }

  static async findByIdAndUpdate(id, updates, _options) {
    const raw = db.categories.findByIdAndUpdate(id, updates);
    if (!raw) return null;
    return new Category(raw);
  }
}

export default Category;
