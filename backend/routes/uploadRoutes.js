const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const protect = require("../middlewares/authMiddleware");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", protect, upload.single("file"), uploadController.uploadFile);
router.delete("/:id", protect, uploadController.deleteFile);
router.get("/user", protect, uploadController.getUserFiles);
router.get("/file/:id", protect, uploadController.getFileById);
router.get("/recent-files", protect, uploadController.getRecentFiles);
router.get('/columns/:fileId', protect, uploadController.getFileColumns);

module.exports = router;
