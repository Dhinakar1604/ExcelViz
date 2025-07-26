// ====== backend/models/ChartHistory.js ======
const mongoose = require('mongoose'); // ✅ Add this line

const chartHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chartType: String,
  xAxis: String,
  yAxis: String,
  fileRef: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ChartHistory', chartHistorySchema);
