import React from "react";
import { Navigate } from "react-router-dom";
import { isAdminTokenValid } from "../utils/checkAdminToken";

const AdminProtectedRoute = ({ children }) => {
    if (!isAdminTokenValid()) {
        return <Navigate to="/admin-login" replace />;
    }
    return children;
};

export default AdminProtectedRoute;
