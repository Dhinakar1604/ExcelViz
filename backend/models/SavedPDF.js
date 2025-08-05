// models/SavedPDF.js

const mongoose = require("mongoose");

const SavedPDFSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UploadedFile",
    required: false, // optional: only if linked to an Excel file
  },
  title: {
    type: String,
    required: true,
  },
  chartType: {
    type: String,
    required: true,
  },
  pdfData: {
    type: Buffer,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SavedPDF", SavedPDFSchema);
