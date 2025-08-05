const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const protect = require("../middlewares/authMiddleware");
const { uploadPDF } = require("../middlewares/multerConfig");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", protect, upload.single("file"), uploadController.uploadFile);

router.post("/upload-pdf", protect, uploadPDF.single("pdf"), uploadController.uploadPDFReport);

router.delete("/:id", protect, uploadController.deleteFile);

router.get("/user", protect, uploadController.getUserFiles);

router.get("/recent-files", protect, uploadController.getRecentFiles);

router.get("/file/:id", protect, uploadController.getFileById);

router.get("/columns/:fileId", protect, uploadController.getFileColumns);

module.exports = router;
