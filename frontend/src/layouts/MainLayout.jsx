/**
 * Main layout wrapper.
 * Provides sidebar, top nav, and toast notifications for all pages.
 */

import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { ToastProvider } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <button
          className="fixed top-4 left-4 z-50 md:hidden rounded-lg bg-brand-600 px-3 py-2 text-white text-sm font-medium shadow-card hover:bg-brand-700"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          Menu
        </button>
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} user={user} onLogout={handleLogout} />
        <div className="md:pl-64">
          <TopNav onMenuToggle={() => setSidebarOpen(true)} user={user} onLogout={handleLogout} />
          <main className="mx-6 mt-4 mb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
};

export default MainLayout;
