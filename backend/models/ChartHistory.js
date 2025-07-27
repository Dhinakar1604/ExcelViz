const mongoose = require('mongoose');

const ChartHistorySchema = new mongoose.Schema({
  chartType: { type: String, required: true },
  xAxis: { type: String, required: true },
  yAxis: { type: String, required: true },
  zAxis: { type: String }, // ✅ Added for 3D
  fileRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('ChartHistory', ChartHistorySchema);
