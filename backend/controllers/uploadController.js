const UploadedFile = require("../models/UploadedFile");
const XLSX = require("xlsx");

// ✅ Upload Excel File
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { originalname, size, buffer } = req.file;

    const newFile = new UploadedFile({
      name: originalname,
      size,
      user: req.user.id,
      buffer,
    });

    await newFile.save();

    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: newFile._id,
        name: newFile.name,
        size: newFile.size,
        uploadedAt: newFile.uploadedAt,
      },
    });
  } catch (err) {
    console.error("[UPLOAD ERROR]:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// ✅ Delete Uploaded File
const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await UploadedFile.findOneAndDelete({
      _id: fileId,
      user: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found or unauthorized" });
    }

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("[DELETE FILE ERROR]:", err);
    res.status(500).json({ message: "Server error during deletion", error: err.message });
  }
};

// ✅ Fetch all user files
const getUserFiles = async (req, res) => {
  try {
    const files = await UploadedFile.find({ user: req.user.id })
      .select("name size uploadedAt")
      .sort({ uploadedAt: -1 });

    res.status(200).json({ files });
  } catch (err) {
    console.error("[GET USER FILES ERROR]:", err);
    res.status(500).json({ message: "Failed to fetch user files", error: err.message });
  }
};

// ✅ Fetch recent files
const getRecentFiles = async (req, res) => {
  try {
    const files = await UploadedFile.find({ user: req.user.id })
      .select("name size uploadedAt")
      .sort({ uploadedAt: -1 })
      .limit(5);

    res.status(200).json({ files });
  } catch (err) {
    console.error("[GET RECENT FILES ERROR]:", err);
    res.status(500).json({ message: "Failed to fetch recent files", error: err.message });
  }
};

// ✅ Download file by ID
const getFileById = async (req, res) => {
  try {
    const fileId = req.params.id;

    const file = await UploadedFile.findOne({
      _id: fileId,
      user: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found or unauthorized" });
    }

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.name}"`,
    });

    res.send(file.buffer);
  } catch (err) {
    console.error("[GET FILE BY ID ERROR]:", err);
    res.status(500).json({ message: "Failed to fetch file", error: err.message });
  }
};

// ✅ Fetch columns from an uploaded Excel file
const getFileColumns = async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const file = await UploadedFile.findOne({
      _id: fileId,
      user: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found or unauthorized" });
    }

    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const firstSheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    const columns = jsonData[0];

    res.status(200).json({ columns });
  } catch (err) {
    console.error("[GET FILE COLUMNS ERROR]:", err);
    res.status(500).json({ message: "Failed to fetch columns", error: err.message });
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getUserFiles,
  getRecentFiles,
  getFileById,
  getFileColumns,
};
