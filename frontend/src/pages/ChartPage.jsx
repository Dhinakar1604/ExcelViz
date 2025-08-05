import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import fileDownload from "js-file-download";
import Plotly from "plotly.js-dist-min";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";;

import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import ChartCanvas3D from "../components/chartcanvas3D";
import "../styles/ChartPage.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const ChartPage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("Bar Chart");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [zAxis, setZAxis] = useState("");
  const [columns, setColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState("");
const [loadingSummary, setLoadingSummary] = useState(false);
const [excelData, setExcelData] = useState([]);
const chartRef = useRef(null);
const summaryRef = useRef(null);
const plotly3DRef = useRef(null);
const fullChartRef = useRef(null);
const [lastSavedAnalysis, setLastSavedAnalysis] = useState(null);
const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) fetchFileColumns(selectedFile);
  }, [selectedFile]);

  const fetchUserFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/upload/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data.files);
    } catch (error) {
      console.error(error);
      alert("Error fetching uploaded files.");
    }
  };

  const fetchFileColumns = async (fileId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/upload/columns/${fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setColumns(res.data.columns);
    } catch (error) {
      console.error(error);
      alert("Error fetching columns.");
    }
  };
const downloadPDFReportFromBackend = async () => {
  if (!chartTitle || !summary || !excelData || !chartRef.current) {
    alert("Missing data for generating PDF report.");
    return;
  }

 let chartImageBase64 = null;

if (chartType.includes("3D")) {
 
  try {
    const plotlyDiv = plotly3DRef.current;
    if (plotlyDiv) {
      chartImageBase64 = await window.Plotly.toImage(plotlyDiv, {
        format: "png",
        width: 500,
        height: 400,
      });
    } else {
      alert("3D chart element not found.");
      return;
    }
  } catch (err) {
    console.error("Plotly 3D image export failed", err);
    alert("Failed to export 3D chart image.");
    return;
  }
} else {
  const chartCanvas = chartRef.current.querySelector("canvas");
  chartImageBase64 = chartCanvas?.toDataURL("image/png");

  if (!chartImageBase64) {
    alert("2D chart image not available.");
    return;
  }
}

try {
  const res = await axios.post(
    "http://localhost:5000/api/analysis/download-report",
    {
      chartTitle,
      summary,
      excelData,
      chartImageBase64,
    },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      responseType: "blob",
    }
  );

  fileDownload(res.data, `${chartTitle || "chart-report"}.pdf`);
} catch (err) {
  console.error("Backend PDF download error", err);
  alert("Failed to download PDF from backend.");
}

  try {
    const res = await axios.post(
      "http://localhost:5000/api/analysis/download-report",
      {
        chartTitle,
        summary,
        excelData,
        chartImageBase64,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob", 
      }
    );

    fileDownload(res.data, `${chartTitle || "chart-report"}.pdf`);
  } catch (err) {
    console.error("Backend PDF download error", err);
    alert("Failed to download PDF from backend.");
  }
};

const generateChart = async () => {
  if (!selectedFile || !xAxis || !yAxis || (chartType.includes("3D") && !zAxis)) {
    alert("Please select all required axes.");
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:5000/api/analysis/generate",
      {
        fileId: selectedFile,
        xAxis,
        yAxis,
        zAxis: chartType.includes("3D") ? zAxis : null,
        chartTitle,
        chartType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const raw = res?.data?.chartData || {};
    const xData = res?.data?.xData || raw?.labels || [];
    const yData = res?.data?.yData || raw?.datasets?.[0]?.data || [];

    const zData = chartType.includes("3D")
      ? res.data.zData && res.data.zData.length > 0
        ? res.data.zData
        : yData
      : [];

    const labelsArray = raw?.labels || xData || [];
    const colors = labelsArray.map(
      () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
    );

    const baseDataset = raw?.datasets?.[0] || {
      label: chartTitle || yAxis || "Dataset",
      data: yData || [],
    };

    const dataset = {
      ...baseDataset,
      backgroundColor: colors,
      borderColor: colors,
      pointBackgroundColor: colors,
      showLine: chartType === "Line Chart",
      tension: 0.4,
    };

    const updatedChartData = {
      labels: labelsArray,
      datasets: [dataset],
      xData,
      yData,
      zData,
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#ffffff" } },
          title: {
            display: true,
            text: chartTitle || "Your Chart",
            color: "#00bfff",
            font: { size: 18 },
          },
        },
        scales: {
          x: {
            ticks: { color: "#ffffff" },
            grid: { color: "rgba(255,255,255,0.1)" },
            title: { display: true, text: xAxis, color: "#ffffff" },
          },
          y: {
            ticks: { color: "#ffffff" },
            grid: { color: "rgba(255,255,255,0.1)" },
            title: { display: true, text: yAxis, color: "#ffffff" },
          },
        },
      },
    };

    setChartData(updatedChartData);
    setExcelData(res.data.excelData || []);
  } catch (error) {
    console.error("generateChart error:", error);
    alert("Error generating chart.");
  } finally {
    setLoading(false);
  }
};


 const saveAnalysis = async () => {
  const currentAnalysis = {
    fileId: selectedFile,
    xAxis,
    yAxis,
    zAxis: chartType.includes("3D") ? zAxis : null,
    chartTitle,
    chartType,
    chartData,
  };

  // ✅ Check for duplicate
  if (
    lastSavedAnalysis &&
    JSON.stringify(currentAnalysis) === JSON.stringify(lastSavedAnalysis)
  ) {
    toast.info(" No changes detected. Analysis already saved.", {
      theme: "dark",
    });
    return;
  }

  try {
    const token = localStorage.getItem("token");
    await axios.post(
      "http://localhost:5000/api/analysis/save",
      currentAnalysis,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.success("Analysis saved!", { theme: "dark" });


    setLastSavedAnalysis(currentAnalysis);
  } catch (error) {
    console.error(error);
    toast.error("Error saving analysis.", { theme: "dark" });
  }
};

  const generateSummary = async () => {
  if (!selectedFile || !chartTitle || !chartType || !xAxis || !yAxis || !chartData) {
    alert("Please generate a chart before requesting a summary.");
    return;
  }

  setLoadingSummary(true);

  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "http://localhost:5000/api/analysis/summary",
      {
        fileId: selectedFile,
        chartTitle,
        chartType,
        xAxis,
        yAxis,
        chartData,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setSummary(res.data.summary);
  } catch (error) {
    console.error("AI Summary Error:", error);
    alert("Failed to generate AI summary.");
  } finally {
    setLoadingSummary(false);
  }
};

  
  const renderChart = () => {
    if (!chartData) return null;

    console.log("✅ 3D Chart Axis Data:", {
      x: chartData.xData,
      y: chartData.yData,
      z: chartData.zData,
    });

    const commonProps = { data: chartData, options: chartData.options };

    switch (chartType) {
      case "Bar Chart":
        return <Bar {...commonProps} />;
      case "Line Chart":
        return <Line {...commonProps} />;
      case "Pie Chart":
        return <Pie {...commonProps} />;
      case "Doughnut Chart":
        return <Doughnut {...commonProps} />;
      case "3D Bar Chart":
      case "3D Line Chart":
        return (
        <ChartCanvas3D
  chartType={chartType}
  chartData={chartData}
  chartTitle={chartTitle}
  plotlyRef={plotly3DRef}
/>


        );
      default:
        return <p>Unsupported chart type</p>;
    }
  };
const handleDownloadPNG = async () => {
  try {
    const logo = new Image();
    logo.src = "/logo.png"; 
    await new Promise((res) => (logo.onload = res));
    if (chartType.includes("3D")) {
  const plotlyDiv = plotly3DRef.current;
  if (!plotlyDiv) {
    alert("3D chart element not found.");
    return;
  }
  await window.Plotly.relayout(plotlyDiv, {
    "paper_bgcolor": "#ffffff",
    "plot_bgcolor": "#ffffff",
    "font.color": "#000000",
    "scene.bgcolor": "#ffffff",
    "scene.xaxis.titlefont.color": "#000000",
    "scene.xaxis.color": "#000000",
    "scene.xaxis.gridcolor": "#999999",
    "scene.yaxis.titlefont.color": "#000000",
    "scene.yaxis.color": "#000000",
    "scene.yaxis.gridcolor": "#999999",
    "scene.zaxis.titlefont.color": "#000000",
    "scene.zaxis.color": "#000000",
    "scene.zaxis.gridcolor": "#999999",
  });

  
  await new Promise((r) => setTimeout(r, 300));
  const plotImage = await window.Plotly.toImage(plotlyDiv, {
    format: "png",
    width: 500,
    height: 400,
  });

  const chartImg = new Image();
  chartImg.src = plotImage;
  await new Promise((res) => (chartImg.onload = res));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 500
  canvas.height = 400;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(logo, 20, 20, 60, 60);
  ctx.fillStyle = "#333";
  ctx.font = "bold 20px Segoe UI";
  ctx.fillText(chartTitle || "3D Chart", 100, 60);
  ctx.drawImage(chartImg, 0, 100);

  const link = document.createElement("a");
  link.download = `${chartTitle || "chart"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();


  await window.Plotly.relayout(plotlyDiv, {
    "paper_bgcolor": "transparent",
    "plot_bgcolor": "transparent",
    "font.color": "#e2e8f0",
    "scene.bgcolor": "rgba(0,0,0,0.05)",
    "scene.xaxis.titlefont.color": "#e2e8f0",
    "scene.xaxis.color": "#e2e8f0",
    "scene.xaxis.gridcolor": "#444",
    "scene.yaxis.titlefont.color": "#e2e8f0",
    "scene.yaxis.color": "#e2e8f0",
    "scene.yaxis.gridcolor": "#444",
    "scene.zaxis.titlefont.color": "#e2e8f0",
    "scene.zaxis.color": "#e2e8f0",
    "scene.zaxis.gridcolor": "#444",
  });

    } else {
     
      if (!chartRef.current) {
        alert("2D chart element not found.");
        return;
      }

      const canvasElem = chartRef.current.querySelector("canvas");
      if (!canvasElem) {
        alert("Chart canvas not found.");
        return;
      }

      const chartInstance = ChartJS.getChart(canvasElem);
      const originalColors = {
        xTick: chartInstance.options.scales.x.ticks.color,
        yTick: chartInstance.options.scales.y.ticks.color,
        xTitle: chartInstance.options.scales.x.title.color,
        yTitle: chartInstance.options.scales.y.title.color,
        title: chartInstance.options.plugins.title.color,
      };

      chartInstance.options.scales.x.ticks.color = "#000";
      chartInstance.options.scales.y.ticks.color = "#000";
      chartInstance.options.scales.x.title.color = "#000";
      chartInstance.options.scales.y.title.color = "#000";
      chartInstance.options.plugins.title.color = "#000";
      chartInstance.update();
      await new Promise((res) => setTimeout(res, 100));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = canvasElem.width;
      const height = canvasElem.height + 100;

      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(logo, 20, 20, 60, 60);
      ctx.fillStyle = "#333";
      ctx.font = "bold 20px Segoe UI";
      ctx.fillText(chartTitle || "Chart", 100, 60);

      ctx.drawImage(canvasElem, 0, 100);

      const link = document.createElement("a");
      link.download = `${chartTitle || "chart"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();


      chartInstance.options.scales.x.ticks.color = originalColors.xTick;
      chartInstance.options.scales.y.ticks.color = originalColors.yTick;
      chartInstance.options.scales.x.title.color = originalColors.xTitle;
      chartInstance.options.scales.y.title.color = originalColors.yTitle;
      chartInstance.options.plugins.title.color = originalColors.title;
      chartInstance.update();
    }
  } catch (error) {
    console.error("PNG Export Error:", error);
    alert("Failed to export chart as PNG.");
  }
};
const handleDownloadPDF = async () => {
  try {
    const logo = new Image();
    logo.src = "/logo.png";
    await new Promise((res) => (logo.onload = res));

    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const padding = 30;
    let y = padding;

    // 📌 Header
    const headerCanvas = document.createElement("canvas");
    const ctx = headerCanvas.getContext("2d");
    headerCanvas.width = 600;
    headerCanvas.height = 100;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, headerCanvas.width, headerCanvas.height);
    ctx.drawImage(logo, 20, 20, 60, 60);
    ctx.fillStyle = "#333";
    ctx.font = "bold 24px 'Segoe UI'";
    ctx.fillText(chartTitle || "Chart Report", 100, 60);
    const headerImg = headerCanvas.toDataURL("image/png");
    doc.addImage(headerImg, "PNG", padding, y, 400, 80);
    y += 100;

    // 🧾 Chart Meta
    doc.setFontSize(12).setTextColor(0, 0, 0);
    doc.text(`Chart Type: ${chartType}`, padding, y);
    y += 18;
    doc.text(`X-Axis: ${xAxis}`, padding, y);
    y += 18;
    doc.text(`Y-Axis: ${Array.isArray(yAxis) ? yAxis.join(", ") : yAxis}`, padding, y);
    if (chartType.includes("3D") && zAxis) {
      y += 18;
      doc.text(`Z-Axis: ${zAxis}`, padding, y);
    }
    y += 20;

    let chartImageData;
    let imgWidth = 500;
    let imgHeight = 400;

    // 🔄 Get chart image
    if (chartType.includes("3D")) {
      const plotlyDiv = plotly3DRef.current;
      if (!plotlyDiv) return alert("3D chart element missing");

      await window.Plotly.relayout(plotlyDiv, {
        margin: { l: 80, r: 80, t: 40, b: 80 },
        paper_bgcolor: "#ffffff",
        plot_bgcolor: "#ffffff",
        font: { color: "#000" },
        scene: {
          xaxis: { titlefont: { color: "#000" }, tickfont: { color: "#000" }, gridcolor: "#ccc" },
          yaxis: { titlefont: { color: "#000" }, tickfont: { color: "#000" }, gridcolor: "#ccc" },
          zaxis: { titlefont: { color: "#000" }, tickfont: { color: "#000" }, gridcolor: "#ccc" },
        },
      });

      await new Promise((r) => setTimeout(r, 300));

      const exportWidth = 450;
      const exportHeight = 340;

      chartImageData = await window.Plotly.toImage(plotlyDiv, {
        format: "png",
        width: exportWidth,
        height: exportHeight,
      });

      imgWidth = exportWidth;
      imgHeight = exportHeight;

    } else {
      const canvasElem = chartRef.current?.querySelector("canvas");
if (!canvasElem) return alert("Chart canvas missing");

const chartInstance = ChartJS.getChart(canvasElem);
if (!chartInstance) return alert("Chart instance not found");

// Temporarily apply export-friendly style
chartInstance.options.plugins.title.display = false;
chartInstance.options.plugins.title.color = "#000";
chartInstance.options.scales.x.ticks.color = "#000";
chartInstance.options.scales.y.ticks.color = "#000";
chartInstance.options.scales.x.title.color = "#000";
chartInstance.options.scales.y.title.color = "#000";
chartInstance.options.scales.x.grid.color = "#999";
chartInstance.options.scales.y.grid.color = "#999";
chartInstance.update();
await new Promise((r) => setTimeout(r, 100));

// Create padded export canvas
const exportCanvas = document.createElement("canvas");
const paddingSpace = 40;
exportCanvas.width = canvasElem.width + paddingSpace * 2;
exportCanvas.height = canvasElem.height + paddingSpace * 2;

const exportCtx = exportCanvas.getContext("2d");
exportCtx.fillStyle = "#ffffff"; // ensure white background
exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
exportCtx.drawImage(canvasElem, paddingSpace, paddingSpace);

// Capture final image
chartImageData = exportCanvas.toDataURL("image/png");
imgWidth = exportCanvas.width;
imgHeight = exportCanvas.height;

      imgWidth = exportCanvas.width / 2;
      imgHeight = exportCanvas.height / 2;

      // 🔁 Restore styles
      chartInstance.options.plugins.title.display = originalOptions.titleDisplay;
      chartInstance.options.plugins.title.color = originalOptions.titleColor;
      chartInstance.options.scales.x.ticks.color = originalOptions.xTickColor;
      chartInstance.options.scales.y.ticks.color = originalOptions.yTickColor;
      chartInstance.options.scales.x.title.color = originalOptions.xTitleColor;
      chartInstance.options.scales.y.title.color = originalOptions.yTitleColor;
      chartInstance.options.scales.x.grid.color = originalOptions.xGridColor;
      chartInstance.options.scales.y.grid.color = originalOptions.yGridColor;
      chartInstance.update();
    }

    // 🖼️ Scale image to fit PDF
    const aspectRatio = imgWidth / imgHeight;
    let displayWidth = pageWidth - padding * 2;
    let displayHeight = displayWidth / aspectRatio;

    if (displayHeight > pageHeight / 2) {
      displayHeight = pageHeight / 2;
      displayWidth = displayHeight * aspectRatio;
    }

    if (y + displayHeight > pageHeight - padding) {
      doc.addPage();
      y = padding;
    }

    const xCentered = (pageWidth - displayWidth) / 2;
    doc.addImage(chartImageData, "PNG", xCentered, y, displayWidth, displayHeight);
    y += displayHeight + 20;

    // 🧠 AI Summary
    doc.setFontSize(14).setTextColor(40, 40, 40);
    doc.text("🧠 AI Summary", padding, y);
    y += 18;
    doc.setFontSize(11).setTextColor(60);
    const summaryText = summaryRef.current?.innerText || "";
    const lines = summaryText.split("\n");
    for (const line of lines) {
      const split = doc.splitTextToSize(line, pageWidth - padding * 2);
      if (y + split.length * 15 >= pageHeight - padding) {
        doc.addPage();
        y = padding;
      }
      doc.text(split, padding, y);
      y += split.length * 15;
    }

    // 📋 Excel Table
    if (excelData?.length && typeof excelData[0] === "object") {
      if (y >= pageHeight - 140) {
        doc.addPage();
        y = padding;
      }

      doc.setFontSize(14).setTextColor(40, 40, 40);
      y += 20;
      doc.text("📋 Data Table (Top Rows)", padding, y);
      y += 15;

      const headers = Object.keys(excelData[0]);
      const rows = excelData.slice(0, 10).map((row) =>
        headers.map((key) => String(row[key] ?? ""))
      );

      doc.autoTable({
        startY: y,
        head: [headers],
        body: rows,
        theme: "striped",
        styles: { fontSize: 10 },
        margin: { left: padding, right: padding },
        tableWidth: "wrap",
      });
    }

    // 💾 Upload to Server
    const pdfBlob = doc.output("blob");
    const formData = new FormData();
    formData.append("pdf", pdfBlob, `${chartTitle || "chart-report"}.pdf`);
    formData.append("title", chartTitle);
    formData.append("fileId", selectedFile);
    formData.append("chartType", chartType);

    await axios.post("http://localhost:5000/api/analysis/upload-pdf", formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });

    doc.save(`${chartTitle || "chart-report"}.pdf`);
  } catch (err) {
    console.error("📄 PDF generation error:", err);
    alert("Something went wrong while exporting PDF.");
  }
};


return (
    <div className="chart-page">
      <div className="chart-container">
        <div className="left-column">
          <div className="chart-form">
            <h2>📊 Create & Visualize Your Analysis</h2>

            <label>Select Uploaded Excel File</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
            >
              <option value="">Select Uploaded Excel File</option>
              {files.map((file) => (
                <option key={file._id} value={file._id}>
                  {file.name}
                </option>
              ))}
            </select>

            <label>Chart Title</label>
            <input
              type="text"
              placeholder="Enter Chart Title"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
            />

            <label>Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="Bar Chart">Bar Chart</option>
              <option value="Line Chart">Line Chart</option>
              <option value="Pie Chart">Pie Chart</option>
              <option value="Doughnut Chart">Doughnut Chart</option>
              <option value="3D Bar Chart">3D Bar Chart</option>
              <option value="3D Line Chart">3D Line Chart</option>
            </select>

            <label>Select X-Axis Column</label>
            <select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
              <option value="">Select X-Axis Column</option>
              {columns.map((col, i) => (
                <option key={i} value={col}>
                  {col}
                </option>
              ))}
            </select>

            <label>Select Y-Axis Column</label>
            <select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
              <option value="">Select Y-Axis Column</option>
              {columns.map((col, i) => (
                <option key={i} value={col}>
                  {col}
                </option>
              ))}
            </select>

            {chartType.includes("3D") && (
              <>
                <label>Select Z-Axis Column</label>
                <select
                  value={zAxis}
                  onChange={(e) => setZAxis(e.target.value)}
                >
                  <option value="">Select Z Axis</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </>
            )}

            <button onClick={generateChart} disabled={loading}>
              {loading ? "Generating..." : "Generate Chart"}
            </button>
            <button onClick={saveAnalysis}>Save Analysis</button>
            <button onClick={generateSummary}>
              {loadingSummary ? "Generating..." : "Generate AI Summary"}
            </button>
            <button onClick={handleDownloadPNG}>📥 Download as PNG</button>
            <button onClick={downloadPDFReportFromBackend}>📥 Download as PDF</button>


          </div>
        </div>

        <div className="right-column">
          <div className="chart-display" ref={chartRef}>
            {chartData &&
            ((chartData.labels && chartData.labels.length > 0) ||
              (chartData.xData && chartData.xData.length > 0)) ? (
              renderChart()
            ) : (
              <p className="no-chart-text">
                No charts yet. Upload data and generate chart.
              </p>
            )}
          </div>
        </div>
      </div>

      {summary && (
        <div className="ai-summary-section" ref={summaryRef}>
          <h3>🧠 AI Summary</h3>
          <div className="summary-text">
            {summary.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};

export default ChartPage;