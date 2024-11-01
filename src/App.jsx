import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/SignUp.jsx";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";
import HomeDashboard from "./pages/HomeDashboard.jsx";
import Employees from "./pages/Employees.jsx";
import EmployeeDetails from "./pages/EmployeeDetails.jsx";
import PrivateRoutes from "./utils/PrivateRoutes.jsx";
import OffboardedResources from "./pages/OffboardedResources.jsx";
import GrossMarginCalculation from "./pages/GrossMarginCalculation.jsx";

export default function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<PrivateRoutes />}>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<HomeDashboard />} />
            <Route path="/employees" element={<Employees />} />{" "}
            <Route
              path="/offboarded-resources"
              element={<OffboardedResources />}
            />{" "}
            <Route path="/employees/:id" element={<EmployeeDetails />} />{" "}
            <Route
              path="/gross-margin-calculation-oh"
              element={<GrossMarginCalculation />}
            />
          </Route>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}
