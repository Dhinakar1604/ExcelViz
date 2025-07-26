const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'UploadedFile', required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  chartTitle: { type: String },
  chartType: { type: String, required: true },
  chartData: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
