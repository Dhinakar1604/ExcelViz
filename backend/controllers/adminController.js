// controllers/adminController.js

const User = require("../models/User");
const Upload = require("../models/UploadedFile");

// ✅ Get dashboard stats
const getStats = async (req, res) => {
  try {
    const [users, uploads] = await Promise.all([
      User.countDocuments(),
      Upload.countDocuments()
    ]);
    res.json({ success: true, users, uploads });
  } catch (error) {
    console.error("Admin getStats error:", error);
    res.status(500).json({ success: false, message: "Server error fetching stats" });
  }
};

// ✅ Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    res.json({ success: true, users });
  } catch (error) {
    console.error("Admin getAllUsers error:", error);
    res.status(500).json({ success: false, message: "Server error fetching users" });
  }
};

// ✅ Delete a user and their uploads
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await Promise.all([
      User.findByIdAndDelete(userId),
      Upload.deleteMany({ user: userId })
    ]);

    res.json({ success: true, message: "User and their uploads deleted successfully" });
  } catch (error) {
    console.error("Admin deleteUser error:", error);
    res.status(500).json({ success: false, message: "Server error deleting user" });
  }
};
// Block user
const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: true },  // <-- use 'blocked'
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User blocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: false }, // <-- use 'blocked'
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User unblocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ Get a user's activity (profile + uploads)
const getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const uploads = await Upload.find({ user: userId })
      .sort({ uploadedAt: -1 })
      .lean();

    res.json({ success: true, user, uploads });
  } catch (error) {
    console.error("Admin getUserActivity error:", error);
    res.status(500).json({ success: false, message: "Server error fetching user activity" });
  }
};

// ✅ Get all uploads
const getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find()
      .populate("user", "name email")
      .sort({ uploadedAt: -1 })
      .lean();

    const formatted = uploads.map(file => ({
      _id: file._id,
      name: file.name,
      size: file.size,
      uploadedAt: file.uploadedAt,
      userName: file.user?.name || "Unknown",
      userEmail: file.user?.email || "Unknown",
    }));

    res.json({ success: true, files: formatted });
  } catch (error) {
    console.error("Admin getAllUploads error:", error);
    res.status(500).json({ success: false, message: "Server error fetching uploads" });
  }
};

// ✅ Delete a specific upload
const deleteUpload = async (req, res) => {
  try {
    const uploadId = req.params.id;

    const upload = await Upload.findById(uploadId);
    if (!upload) return res.status(404).json({ success: false, message: "Upload not found" });

    await Upload.findByIdAndDelete(uploadId);
    res.json({ success: true, message: "Upload deleted successfully" });
  } catch (error) {
    console.error("Admin deleteUpload error:", error);
    res.status(500).json({ success: false, message: "Server error deleting upload" });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  blockUser,
  unblockUser,
  getUserActivity,
  getAllUploads,
  deleteUpload
};
