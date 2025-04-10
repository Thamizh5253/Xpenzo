import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/layouts/Sidebar";
import Header from "./components/layouts/Header";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import AppRoutes from "./components/routes/AppRoutes";
import ForgotPassword from "./components/pages/ForgotPassword";                                                                                                  
import ResetPassword from "./components/pages/ResetPassword";

function App() {
  const [isOpen, setIsOpen] = useState(true);

  // Load auth state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setAuth={setIsAuthenticated} />  
            )} />
        <Route path="/register" element={isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )} />
        <Route path="/forgot-password" element={isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPassword />  
            )}  />

        <Route path="/reset-password/" element={isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ResetPassword />
            )}  />
        {/* Protected dashboard routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-gray-100">
                <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Header  setAuth={setIsAuthenticated}/>
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
