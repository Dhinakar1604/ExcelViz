const XLSX = require('xlsx');
const File = require('../models/UploadedFile');
const Analysis = require('../models/Analysis');

exports.generateChart = async (req, res) => {
  try {
    const { fileId, xAxis, yAxis, chartTitle, chartType } = req.body;

    if (!fileId || !xAxis || !yAxis) {
      return res.status(400).json({ message: "Missing required fields: fileId, xAxis, or yAxis." });
    }

    const fileRecord = await File.findOne({ _id: fileId, user: req.user.id });
    if (!fileRecord) {
      return res.status(404).json({ message: "File not found for this user." });
    }

    if (!fileRecord.buffer) {
      return res.status(404).json({ message: "No file data found in record." });
    }

    const workbook = XLSX.read(fileRecord.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData.length) {
      return res.status(400).json({ message: "Excel file contains no data." });
    }

    const labels = jsonData.map(row => row[xAxis] ?? "N/A");
    const data = jsonData.map(row => {
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
          fill: !chartType.toLowerCase().includes('line'),
        },
      ],
    };

    return res.status(200).json({ chartData });
  } catch (err) {
    console.error("[generateChart] Error:", err);
    return res.status(500).json({ message: "Server error while generating chart.", error: err.message });
  }
};

// ✅ Save generated chart
exports.saveChart = async (req, res) => {
  try {
    const { fileId, xAxis, yAxis, chartTitle, chartType, chartData } = req.body;

    if (!fileId || !xAxis || !yAxis || !chartType || !chartData) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newAnalysis = new Analysis({
      user: req.user.id,
      fileId,
      xAxis,
      yAxis,
      chartTitle,
      chartType,
      chartData,
    });

    await newAnalysis.save();
    return res.status(201).json({ message: "Chart saved successfully.", analysis: newAnalysis });
  } catch (err) {
    console.error("[saveChart] Error:", err);
    return res.status(500).json({ message: "Server error while saving chart.", error: err.message });
  }
};

// ✅ Get user's chart history
exports.getUserChartHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ history });
  } catch (err) {
    console.error("[getUserChartHistory] Error:", err);
    return res.status(500).json({ message: "Server error while fetching chart history.", error: err.message });
  }
};

// ✅ Get single analysis by ID
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (analysis.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to access this analysis." });
    }

    return res.status(200).json({ analysis });
  } catch (err) {
    console.error("[getAnalysisById] Error:", err);
    return res.status(500).json({ message: "Server error while fetching analysis.", error: err.message });
  }
};

// ✅ Delete analysis by ID
exports.deleteAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    if (analysis.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this analysis." });
    }

    await analysis.deleteOne();
    return res.status(200).json({ message: "Analysis deleted successfully." });
  } catch (err) {
    console.error("[deleteAnalysisById] Error:", err);
    return res.status(500).json({ message: "Server error while deleting analysis.", error: err.message });
  }
};

// ✅ Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const chartsCreated = await Analysis.countDocuments({ user: req.user.id });
    const filesUploaded = await File.countDocuments({ user: req.user.id });

    return res.status(200).json({ chartsCreated, filesUploaded });
  } catch (err) {
    console.error("[getUserStats] Error:", err);
    return res.status(500).json({ message: "Server error while fetching stats.", error: err.message });
  }
};

// ✅ Generate summary based on uploaded excel & chart info
exports.generateSummary = async (req, res) => {
  try {
    const { fileId, chartTitle, chartType, xAxis, yAxis, zAxis } = req.body;

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required." });
    }

    // Find the uploaded file record for this user
    const fileRecord = await File.findOne({ _id: fileId, user: req.user.id });
    if (!fileRecord) {
      return res.status(404).json({ message: "File not found for this user." });
    }

    if (!fileRecord.buffer) {
      return res.status(404).json({ message: "No file data found in record." });
    }

    // Read excel data from buffer
    const workbook = XLSX.read(fileRecord.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData.length) {
      return res.status(400).json({ message: "Excel file contains no data." });
    }

    // Build a simple summary string based on the chart info and sample data
    let summary = `Summary for chart "${chartTitle || "Untitled"}":\n`;
    summary += `Chart Type: ${chartType}\n`;
    summary += `X-Axis: ${xAxis}, Y-Axis: ${yAxis}`;
    if (zAxis) summary += `, Z-Axis: ${zAxis}`;
    summary += `\n\nTotal rows in data: ${jsonData.length}\n\n`;

    summary += "Sample data rows:\n";
    jsonData.slice(0, 3).forEach((row, i) => {
      summary += `Row ${i + 1}: `;
      summary += `${xAxis}: ${row[xAxis] ?? "N/A"}, `;
      summary += `${yAxis}: ${row[yAxis] ?? "N/A"}`;
      if (zAxis) summary += `, ${zAxis}: ${row[zAxis] ?? "N/A"}`;
      summary += "\n";
    });

    summary += "\n(This is an autogenerated summary based on your uploaded data.)";

    return res.status(200).json({ summary });
  } catch (err) {
    console.error("[generateSummary] Error:", err);
    return res.status(500).json({ message: "Server error while generating summary.", error: err.message });
  }
};
