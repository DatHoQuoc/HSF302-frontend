import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect } from "react"; // Import useEffect

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ActivateAccount from "./pages/ActivateAccount";
import MyBooks from "./pages/MyBooks";
import NotFound from "./pages/NotFound";

// Giả sử bạn có một apiClient đã được cấu hình để gửi request đến backend
// import apiClient from './api/apiClient'; // Đảm bảo bạn có cái này

const queryClient = new QueryClient();

// Tạo một component riêng để chứa logic useEffect và sử dụng useNavigate
// vì useNavigate chỉ có thể được gọi trong context của Router.
const AppContent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlRole = params.get("role");

    if (urlToken && urlRole) {
      // 1. Lưu token và role vào localStorage
      localStorage.setItem("authToken", urlToken);
      localStorage.setItem("role", urlRole);

      // 2. Xóa token và role khỏi URL lịch sử trình duyệt
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("token");
      cleanUrl.searchParams.delete("role");
      window.history.replaceState({}, document.title, cleanUrl.pathname);

      // 3. Chuyển hướng người dùng đến trang /home
      navigate("/home");

      // OPTIONAL: Bạn có thể gọi API để lấy thông tin người dùng ngay tại đây
      // (Nếu bạn muốn đảm bảo user state được cập nhật ngay sau khi chuyển hướng)
      // let authToken = urlToken;
      // let userRole = urlRole;
      // if (authToken && userRole === "PATIENT") {
      //   apiClient.get("/patients/me", {
      //     headers: { Authorization: `Bearer ${authToken}` }
      //   })
      //   .then(res => {
      //     localStorage.setItem("user", JSON.stringify(res.data));
      //     // Set user state nếu bạn có dùng Context API hoặc Redux
      //   })
      //   .catch(err => {
      //     console.error("Lỗi lấy thông tin bệnh nhân", err);
      //     localStorage.removeItem("authToken");
      //     localStorage.removeItem("role");
      //     localStorage.removeItem("user");
      //     navigate("/login"); // Chuyển hướng về trang login nếu lỗi
      //   });
      // }
    }
    // Logic để lấy thông tin người dùng từ localStorage khi ứng dụng khởi động lại
    // (nếu token đã có sẵn trong localStorage từ lần đăng nhập trước)
    else {
      const authToken = localStorage.getItem("authToken");
      const userRole = localStorage.getItem("role");

    }
  }, [navigate]); 

  return (
    <Routes>
      {/* <Route path="/" element={<Login />} />  */}
      {/* Để / luôn là /login nếu bạn muốn, nhưng tốt hơn nên điều hướng trực tiếp */}
      <Route path="/" element={<Login />} /> {/* Người dùng truy cập / sẽ thấy trang Login */}
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
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent /> {/* Render AppContent bên trong BrowserRouter */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;