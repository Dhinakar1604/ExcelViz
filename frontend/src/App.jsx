import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UploadPage from "./pages/UploadPage";
import History from "./pages/History";
import AdminLogin from "./pages/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminUserLoginPage from "./pages/AdminUserLoginPage";
import ChartPage from "./pages/ChartPage";
import AdminUploads from "./pages/AdminUploads";
import AdminUsers from "./pages/AdminUsers";
import SavedAnalyses from "./pages/SavedAnalyses";
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  return (

    <Router>
      
      <Routes>
       
        <Route path="/" element={<Navigate to="/login" replace />} />

        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

     
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
         <Route path="/admin-login" element={<AdminLogin />} />
         <Route
  path="/admin-dashboard"
  element={
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  }
/>
<Route path="/admin-user-login" element={<AdminUserLoginPage />} />
     
        <Route path="/upload" element={<UploadPage />} />

        
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/history" element={<History />} />
        <Route path="/charts" element={<ChartPage />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-uploads" element={<AdminUploads />} />
        <Route path="/saved-analyses" element={<SavedAnalyses />} />

        


        </Routes>
    </Router>
  );
};

export default App;
