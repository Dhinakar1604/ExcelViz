const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware");
const UploadedFile = require("../models/UploadedFile");

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const chartsCreated = 0;

    const filesUploaded = await UploadedFile.countDocuments({ userId });

   
    const recentFiles = await UploadedFile.find({ userId })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .select("name uploadedAt size");

    res.json({
      chartsCreated,
      filesUploaded,
      recentFiles: recentFiles.map(file => ({
        id: file._id,          
        name: file.name,
        uploadedAt: file.uploadedAt,
        size: file.size,
      })),
    });
  } catch (error) {
    console.error("[DASHBOARD FETCH ERROR]:", error);
    res.status(500).json({ message: "Server error fetching dashboard data." });
  }
});

module.exports = router;
