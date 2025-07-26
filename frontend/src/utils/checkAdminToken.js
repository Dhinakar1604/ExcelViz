
import { jwtDecode } from "jwt-decode";

export const isAdminTokenValid = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return false;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
            console.warn("Admin token expired.");
            return false;
        }
        return decoded.role === "admin";
    } catch (err) {
        console.error("Admin token decode error:", err);
        return false;
    }
};
