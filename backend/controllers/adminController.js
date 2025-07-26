const User = require('../models/User');
const Upload = require('../models/UploadedFile'); 

exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const uploads = await Upload.countDocuments(); 

    res.json({ users, uploads });
  } catch (error) {
    console.error('Admin getStats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Admin getAllUsers error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Upload.deleteMany({ user: userId });
    res.json({ message: "User and their uploads deleted successfully" });
  } catch (error) {
    console.error("Admin deleteUser error:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
};

exports.getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find().populate("user", "name email").sort({ uploadedAt: -1 });
    const formatted = uploads.map(file => ({
      _id: file._id,
      name: file.name,
      size: file.size,
      uploadedAt: file.uploadedAt,
      userName: file.user ? file.user.name : "Unknown",
      userEmail: file.user ? file.user.email : "Unknown",
    }));
    res.json({ files: formatted });
  } catch (error) {
    console.error("Admin getAllUploads error:", error);
    res.status(500).json({ message: "Server error fetching uploads" });
  }
};


exports.deleteUpload = async (req, res) => {
  try {
    const uploadId = req.params.id;
    await Upload.findByIdAndDelete(uploadId);
    res.json({ message: "Upload deleted successfully" });
  } catch (error) {
    console.error("Admin deleteUpload error:", error);
    res.status(500).json({ message: "Server error deleting upload" });
  }
};
