
const ChartHistory = require('../models/ChartHistory');

exports.saveChartConfig = async (req, res) => {
  try {
    const { chartType, xAxis, yAxis, fileRef } = req.body;

    if (!chartType || !xAxis || !yAxis || !fileRef) {
      return res.status(400).json({ message: "All fields are required: chartType, xAxis, yAxis, fileRef." });
    } 

    const newChart = await ChartHistory.create({
      user: req.user.userId, 
      chartType,
      xAxis,
      yAxis,
      fileRef,
    });

    res.status(201).json({ message: 'Chart config saved', chart: newChart });
  } catch (err) {
    console.error("saveChartConfig error:", err);
    res.status(500).json({ message: "Server error while saving chart config.", error: err.message });
  }
};

exports.getUserHistory = async (req, res) => {
  try {
    const history = await ChartHistory.find({ user: req.user.userId }).sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (err) {
    console.error("getUserHistory error:", err);
    res.status(500).json({ message: "Server error while fetching chart history.", error: err.message });
  }
};
exports.generateChart = async (req, res) => {
  try {
    const { fileId, xAxis, yAxis, chartTitle, chartType } = req.body;
    if (!fileId || !xAxis || !yAxis || !chartType) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Perform your chart generation logic here or simulate response
    const chartData = {
      labels: ['A', 'B', 'C'],
      datasets: [{
        label: chartTitle || 'Chart',
        data: [10, 20, 30],
        backgroundColor: ['red', 'blue', 'green'],
      }],
    };
    res.status(200).json({ chartData });
  } catch (err) {
    console.error("[generateChart ERROR]:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
