const mongoose = require('mongoose');

const UploadedFileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  buffer: { type: Buffer, required: true },
});

module.exports = mongoose.model('UploadedFile', UploadedFileSchema);
