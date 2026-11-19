/**
 * User model - In-memory implementation (replaces Mongoose)
 */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db, generateId } from "../config/db.js";

class User {
  constructor(data) {
    this._id = data._id || generateId();
    this.name = data.name;
    this.email = data.email?.toLowerCase()?.trim();
    this.password = data.password;
    this.currency = data.currency || "INR";
    this.theme = data.theme || "light";
    this.dateFormat = data.dateFormat || "dd MMM yyyy";
    this.role = data.role || "user";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  get id() {
    return this._id;
  }

  async matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  }

  getSignedJwtToken() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  toJSON() {
    return {
      id: this._id,
      name: this.name,
      email: this.email,
      currency: this.currency,
      theme: this.theme,
      dateFormat: this.dateFormat,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Static methods mimic Mongoose model interface
  static async create(data) {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const userData = {
      ...data,
      password: hashedPassword,
      email: data.email?.toLowerCase()?.trim(),
    };

    const raw = db.users.create(userData);
    return new User(raw);
  }

  static async findOne(filter) {
    const raw = db.users.findOne(filter);
    if (!raw) return null;
    return new User(raw);
  }

  static async findById(id) {
    const raw = db.users.findById(id);
    if (!raw) return null;
    return new User(raw);
  }

  static async findByIdAndUpdate(id, updates, _options) {
    const raw = db.users.findByIdAndUpdate(id, updates);
    if (!raw) return null;
    return new User(raw);
  }

  // Chainable select helper (for compatibility)
  static findByIdSelect(id) {
    const raw = db.users.findById(id);
    if (!raw) return null;
    return new User(raw);
  }
}

// Monkey-patch findOne to support .select("+password") chain
const originalFindOne = User.findOne;
User.findOne = function (filter) {
  const promise = originalFindOne.call(this, filter);
  promise.select = () => promise; // no-op chain
  return promise;
};

const originalFindById = User.findById;
User.findById = function (id) {
  const promise = originalFindById.call(this, id);
  promise.select = () => promise; // no-op chain
  return promise;
};

export default User;
