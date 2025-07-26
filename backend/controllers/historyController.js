const UploadedFile = require("../models/UploadedFile");

const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const filesUploaded = await UploadedFile.countDocuments({ userId });
    const recentFiles = await UploadedFile.find({ userId })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .select("name size uploadedAt");

    
    const chartsCreated = 0;

    res.json({
      chartsCreated,
      filesUploaded,
      recentFiles,
    });
  } catch (err) {
    console.error("[DASHBOARD DATA ERROR]:", err);
    res.status(500).json({ message: "Failed to fetch dashboard data", error: err.message });
  }
};

module.exports = { getDashboardData };
