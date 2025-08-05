const XLSX = require("xlsx");
const File = require("../models/File");
const ChartHistory = require("../models/ChartHistory");
const SavedPDF = require("../models/SavedPDF");

// Save chart config (history)
exports.saveChartConfig = async (req, res) => {
  try {
    const { chartType, xAxis, yAxis, zAxis, fileRef } = req.body;

    if (!chartType || !xAxis || !yAxis || !fileRef) {
      return res.status(400).json({
        message: "All fields are required: chartType, xAxis, yAxis, fileRef.",
      });
    }

    const newChart = await ChartHistory.create({
      chartType,
      xAxis,
      yAxis,
      zAxis,
      fileRef,
      user: req.user.userId,
    });

    res.status(201).json({ message: "Chart config saved", chart: newChart });
  } catch (err) {
    console.error("saveChartConfig error:", err);
    res.status(500).json({
      message: "Server error while saving chart config.",
      error: err.message,
    });
  }
};

// Fetch chart history
exports.getUserHistory = async (req, res) => {
  try {
    const history = await ChartHistory.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(history);
  } catch (err) {
    console.error("getUserHistory error:", err);
    res.status(500).json({
      message: "Server error while fetching chart history.",
      error: err.message,
    });
  }
};

// Generate chart data (2D/3D)
exports.generateChart = async (req, res) => {
  try {
    const { fileId, xAxis, yAxis, zAxis, chartTitle, chartType } = req.body;

    if (!fileId || !xAxis || !yAxis) {
      return res.status(400).json({
        message: "Missing required fields: fileId, xAxis, or yAxis.",
      });
    }

    const fileRecord = await File.findOne({ _id: fileId, user: req.user.id });
    if (!fileRecord || !fileRecord.buffer) {
      return res.status(404).json({ message: "File not found or buffer missing." });
    }

    const workbook = XLSX.read(fileRecord.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData.length) {
      return res.status(400).json({ message: "Excel file contains no data." });
    }

    // 3D chart
    if (chartType.toLowerCase().includes("3d")) {
      if (!zAxis) {
        return res.status(400).json({ message: "Z-axis is required for 3D charts." });
      }

      const xData = jsonData.map((row) => row[xAxis] ?? "N/A");
      const yData = jsonData.map((row) => row[yAxis] ?? "N/A");
      const zData = jsonData.map((row) => {
        const val = parseFloat(row[zAxis]);
        return isNaN(val) ? 0 : val;
      });

      return res.status(200).json({
        chartData: {
          x: xData,
          y: yData,
          z: zData,
          chartTitle,
          chartType,
        },
      });
    }

    // 2D chart
    const labels = jsonData.map((row) => row[xAxis] ?? "N/A");
    const data = jsonData.map((row) => {
      const val = parseFloat(row[yAxis]);
      return isNaN(val) ? 0 : val;
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: chartTitle || yAxis || "Data",
          data,
          
          backgroundColor: "rgba(75,192,192,0.6)",
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1,
          fill: !chartType.toLowerCase().includes("line"),
        },
      ],
    };

    return res.status(200).json({ chartData });
  } catch (err) {
    console.error("[generateChart] Error:", err);
    return res.status(500).json({
      message: "Server error while generating chart.",
      error: err.message,
    });
  }
};

// Upload generated PDF
exports.uploadPDFReport = async (req, res) => {
  try {
    const { title, chartType, fileId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required." });
    }

    const pdfDoc = new SavedPDF({
      userId: req.user.id,
      fileId,
      title,
      chartType,
      pdfData: req.file.buffer,
    });

    await pdfDoc.save();

    res.status(200).json({
      message: "PDF saved successfully.",
      id: pdfDoc._id,
    });
  } catch (err) {
    console.error("[uploadPDFReport] Error:", err);
    res.status(500).json({
      message: "Failed to save PDF report.",
      error: err.message,
    });
  }
};
