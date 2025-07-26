const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const UploadedFile = require("../models/UploadedFile");

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await UploadedFile.find({ userId }).sort({ uploadedAt: -1 });

    res.json({
      files: files.map(file => ({
        id: file._id,
        name: file.name,
        uploadedAt: file.uploadedAt,
        size: file.size,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;
