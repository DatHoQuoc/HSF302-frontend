// App.jsx - Updated version
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ActivateAccount from "./pages/ActivateAccount";
import MyBooks from "./pages/MyBooks";
import NotFound from "./pages/NotFound";
import {authenticationService} from '@/service/AuthenticationService'

// Import notification context
import { NotificationProvider } from "./NotificationContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlRole = params.get("role");

    if (urlToken && urlRole) {
      // 1. Save token and role to localStorage
      localStorage.setItem("authToken", urlToken);
      localStorage.setItem("role", urlRole);

      // 2. Remove token and role from URL
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("token");
      cleanUrl.searchParams.delete("role");
      window.history.replaceState({}, document.title, cleanUrl.pathname);
      const data = authenticationService.getProfile();

      // 3. Navigate to home
      navigate("/home");

      // OPTIONAL: Fetch user info and store in localStorage
      // This is important for WebSocket to get userId
      // fetchUserInfo(urlToken, urlRole);
    }
  }, [navigate]);

  // Optional: Function to fetch and store user info
  const fetchUserInfo = async (token, role) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate-account" element={<ActivateAccount />} />
      <Route path="/my-books" element={<MyBooks />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <NotificationProvider>
          <AppContent />
          {/* Toasters for notifications */}
          <Toaster />
          <Sonner position="top-right" />
        </NotificationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;