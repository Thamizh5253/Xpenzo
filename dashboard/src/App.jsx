import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/layouts/Sidebar";
import Header from "./components/layouts/Header";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AppRoutes from "./routes/AppRoutes";
import ForgotPassword from "./pages/Auth/ForgotPassword";                                                                                                  
import ResetPassword from "./pages/Auth/ResetPassword";
import { useAuth } from "./context/AuthContext";

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const { accessToken } = useAuth();
  
  // Remove the separate isAuthenticated state - we'll use accessToken directly
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route 
          path="/login" 
          element={accessToken ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={accessToken ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route 
          path="/forgot-password" 
          element={accessToken ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}  
        />
        <Route 
          path="/reset-password/" 
          element={accessToken ? <Navigate to="/dashboard" replace /> : <ResetPassword />}  
        />
        
        {/* Protected dashboard routes */}
        <Route
          path="/*"
          element={
            accessToken ? (
              <div className="flex h-screen bg-gray-100">
                <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto p-4">
                    <AppRoutes />
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;