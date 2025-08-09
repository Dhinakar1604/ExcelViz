const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const protect = require("../middlewares/authMiddleware");
const adminProtect = require("../middlewares/adminMiddleware");

router.get("/stats", protect, adminProtect, adminController.getStats);


router.get("/users", protect, adminProtect, adminController.getAllUsers);


router.delete("/users/:id", protect, adminProtect, adminController.deleteUser);
router.put("/users/:id/block", protect, adminProtect, adminController.blockUser);
router.put("/users/:id/unblock", protect, adminProtect, adminController.unblockUser);


router.get("/users/:id/activity", protect, adminProtect, adminController.getUserActivity);


router.get("/uploads", protect, adminProtect, adminController.getAllUploads);

router.delete("/uploads/:id", protect, adminProtect, adminController.deleteUpload);

module.exports = router;
