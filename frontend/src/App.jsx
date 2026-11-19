import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import DailyTrackingPage from "@/pages/DailyTrackingPage";
import MonthlyReportsPage from "@/pages/MonthlyReportsPage";
import YearlyReportsPage from "@/pages/YearlyReportsPage";
import BudgetsPage from "@/pages/BudgetsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const GuestRoutes = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route
          index
          element={
            <ProtectedRoutes>
              <DashboardPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="transactions"
          element={
            <ProtectedRoutes>
              <TransactionsPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="daily"
          element={
            <ProtectedRoutes>
              <DailyTrackingPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="reports/monthly"
          element={
            <ProtectedRoutes>
              <MonthlyReportsPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="reports/yearly"
          element={
            <ProtectedRoutes>
              <YearlyReportsPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="budgets"
          element={
            <ProtectedRoutes>
              <BudgetsPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="categories"
          element={
            <ProtectedRoutes>
              <CategoriesPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoutes>
              <SettingsPage />
            </ProtectedRoutes>
          }
        />
      </Route>

      <Route
        path="login"
        element={
          <GuestRoutes>
            <LoginPage />
          </GuestRoutes>
        }
      />
      <Route
        path="register"
        element={
          <GuestRoutes>
            <RegisterPage />
          </GuestRoutes>
        }
      />
    </Routes>
  );
}

export default App;
