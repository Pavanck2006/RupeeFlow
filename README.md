# RupeeFlow

PennyPilot – A smart personal finance management application to track daily income, expenses, savings, monthly budgets, and yearly financial reports. Take control of your money with insightful dashboards and analytics.

## Project Structure

- `backend/` – Node.js + Express API server (port 5000)
- `frontend/` – React + Vite client (port 5173)

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas account (or a MongoDB connection string)

## Getting Started

### 1. Install dependencies

From the repository root (`RupeeFlow/`):

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure environment variables

**Backend** (`backend/.env`): copy `backend/.env.example` to `backend/.env` and fill in your values:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/rupeeflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`): copy `frontend/.env.example` to `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MOCK_MODE=false
```

### 3. Running the project

Run both the backend and frontend in separate terminals:

**Backend** (from `backend/`):

```bash
# Development (auto-reloads)
npm run dev

# Production
npm start
```

**Frontend** (from `frontend/`):

```bash
# Development with hot-reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

Once running, the API is at `http://localhost:5000` and the frontend is at `http://localhost:5173`.
