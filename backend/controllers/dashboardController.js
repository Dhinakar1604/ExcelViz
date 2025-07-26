const UploadedFile = require("../models/UploadedFile");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId; // This is correct with your current authMiddleware

    const chartsCreated = 0; // adjust if tracking
    const filesUploaded = await UploadedFile.countDocuments({ userId });
    const recentFiles = await UploadedFile.find({ userId })
      .sort({ uploadedAt: -1 })
      .limit(5);

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
    console.error("[DashboardController] Fetch error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};