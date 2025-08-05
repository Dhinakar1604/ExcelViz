const XLSX = require('xlsx');
const File = require('../models/UploadedFile');
const Analysis = require('../models/Analysis');
const path = require('path');
const fs = require('fs');
const generateChartPDF = require('../utils/pdfGenerator');

// 🧾 Download PDF Report
exports.downloadPDFReport = async (req, res) => {
  try {
    const { chartTitle, summary, excelData, chartImageBase64 } = req.body;

    if (!chartTitle || !summary || !excelData || !chartImageBase64) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const imageBuffer = Buffer.from(chartImageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const fileName = `Chart_Report_${Date.now()}.pdf`;
    const outputPath = path.join(__dirname, "../output", fileName);

    await generateChartPDF(outputPath, chartTitle, imageBuffer, summary, excelData);

    setTimeout(() => {
      res.download(outputPath, fileName, (err) => {
        if (err) {
          console.error("PDF download error:", err);
          return res.status(500).json({ message: "Failed to send PDF." });
        }
        fs.unlink(outputPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting PDF:", unlinkErr);
        });
      });
    }, 1000);

  } catch (err) {
    console.error("[downloadPDFReport] Error:", err);
    res.status(500).json({ message: "Failed to generate and download PDF." });
  }
};

// 💾 Save Chart
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

// 📚 Get All User Chart History
exports.getUserChartHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ history });
  } catch (err) {
    console.error("[getUserChartHistory] Error:", err);
    return res.status(500).json({ message: "Server error while fetching chart history.", error: err.message });
  }
};

// 📄 Get Single Analysis
exports.getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis || analysis.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized or not found." });
    }
    return res.status(200).json({ analysis });
  } catch (err) {
    console.error("[getAnalysisById] Error:", err);
    return res.status(500).json({ message: "Server error while fetching analysis.", error: err.message });
  }
};

// 🗑️ Delete Analysis
exports.deleteAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    if (!analysis || analysis.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized or not found." });
    }

    await analysis.deleteOne();
    return res.status(200).json({ message: "Analysis deleted successfully." });
  } catch (err) {
    console.error("[deleteAnalysisById] Error:", err);
    return res.status(500).json({ message: "Server error while deleting analysis.", error: err.message });
  }
};

// 📊 Get User Stats
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

// 🤖 Generate AI Summary
exports.generateSummary = async (req, res) => {
  try {
    const { fileId, chartTitle, chartType, xAxis, yAxis, zAxis } = req.body;

    const fileRecord = await File.findOne({ _id: fileId, user: req.user.id });
    if (!fileRecord?.buffer) {
      return res.status(404).json({ message: "File not found or missing buffer." });
    }

    const workbook = XLSX.read(fileRecord.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    if (!jsonData.length) {
      return res.status(400).json({ message: "Excel file contains no data." });
    }

    const yValues = jsonData.map(row => parseFloat(row[yAxis])).filter(val => !isNaN(val));
    const xValues = jsonData.map(row => row[xAxis]);

    if (yValues.length === 0) {
      return res.status(400).json({ message: "No numeric Y-Axis values found." });
    }

    const total = yValues.reduce((acc, val) => acc + val, 0);
    const average = (total / yValues.length).toFixed(2);
    const max = Math.max(...yValues);
    const min = Math.min(...yValues);
    const maxLabel = xValues[yValues.indexOf(max)] ?? "N/A";
    const minLabel = xValues[yValues.indexOf(min)] ?? "N/A";
    const change = (((yValues.at(-1) - yValues[0]) / yValues[0]) * 100).toFixed(2);

    let summary = `🧠 AI Summary\n\nSummary for chart "${chartTitle || "Untitled"}" (${chartType}):\n`;
    summary += `X-Axis: ${xAxis}, Y-Axis: ${yAxis}`;
    if (zAxis) summary += `, Z-Axis: ${zAxis}`;
    summary += `\n\n📊 Stats:\n`;
    summary += `- Total ${yAxis}: ${total}\n`;
    summary += `- Average ${yAxis}: ${average}\n`;
    summary += `- Max ${yAxis}: ${max} (${maxLabel})\n`;
    summary += `- Min ${yAxis}: ${min} (${minLabel})\n`;
    summary += `\n📈 Trend:\n- ${change > 0 ? "Increase" : "Decrease"} of ${Math.abs(change)}% from first to last data point\n`;
    summary += `\n🔍 Sample Data:\n`;
    jsonData.slice(0, 3).forEach((row, i) => {
      summary += `Row ${i + 1}: ${xAxis}: ${row[xAxis]}, ${yAxis}: ${row[yAxis]}`;
      if (zAxis) summary += `, ${zAxis}: ${row[zAxis]}`;
      summary += `\n`;
    });
    summary += `\n🧾 Notes:\n- Data analyzed using AI-enhanced heuristics.\n`;

    return res.status(200).json({ summary });

  } catch (err) {
    console.error("[generateSummary] Error:", err);
    return res.status(500).json({ message: "Failed to generate summary", error: err.message });
  }
};

exports.generateChart = async (req, res) => {
  try {
    const { fileId, xAxis, yAxis, zAxis, chartTitle, chartType } = req.body;

    if (!fileId || !xAxis || !yAxis) {
      return res.status(400).json({ message: "Missing required fields: fileId, xAxis, or yAxis." });
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

    const lowerType = chartType.toLowerCase();

    // ✅ Pie / Doughnut Chart
    if (["pie chart", "doughnut chart"].includes(lowerType)) {
      const labelSet = [...new Set(jsonData.map(row => row[xAxis] ?? "N/A"))];
      const counts = labelSet.map(label =>
        jsonData.filter(row => row[xAxis] === label).length
      );

      const chartData = {
        labels: labelSet,
        datasets: [
          {
            label: chartTitle || xAxis || "Distribution",
            data: counts,
            backgroundColor: labelSet.map(
              () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
            ),
          },
        ],
      };

      return res.status(200).json({
        chartData,
        xData: labelSet,
        yData: counts,
        excelData: jsonData,
      });
    }

    // ✅ 3D Chart
    if (lowerType.includes("3d")) {
      if (!zAxis) {
        return res.status(400).json({ message: "Z-axis is required for 3D charts." });
      }

      const xData = jsonData.map(row => row[xAxis] ?? "N/A");
      const yData = jsonData.map(row => row[yAxis] ?? "N/A");
      const zData = jsonData.map(row => {
        const val = parseFloat(row[zAxis]);
        return isNaN(val) ? 0 : val;
      });

      return res.status(200).json({
        chartData: { x: xData, y: yData, z: zData, chartTitle, chartType },
        xData,
        yData,
        zData,
        excelData: jsonData,
      });
    }

    // ✅ 2D Chart (Bar, Line, etc.)
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
          fill: !lowerType.includes("line"),
        },
      ],
    };

    return res.status(200).json({
      chartData,
      xData: labels,
      yData: data,
      excelData: jsonData,
    });
  } catch (err) {
    console.error("[generateChart] Error:", err);
    return res.status(500).json({ message: "Server error while generating chart.", error: err.message });
  }
};

