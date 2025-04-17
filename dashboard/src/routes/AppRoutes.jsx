import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
// import Register from "../pages/Register";
// import Login from "../pages/Login";
import OCR from "../pages/UploadReceipt";
import Charts from "../pages/ChartData";
import Profile from "../pages/Profile";
import NewExpense from "../pages/NewExpense";
import AskAI from "../pages/AskAI";
import Schedule from "../pages/Schedules/Schedule";
// import About from "../pages/About";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} /> */}
      <Route path="/ocr" element={<OCR />} />
      <Route path="/charts" element={<Charts />} />
      <Route path="/profile-setup" element={<Profile />} />
      <Route path="/new-expense" element={<NewExpense />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/askai" element={<AskAI />} />
      <Route path="/schedules" element={<Schedule />} />

      {/* <Route path="/about" element={<About />} /> */}
    </Routes>
  );
};

export default AppRoutes;
