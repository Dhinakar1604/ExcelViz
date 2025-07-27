import React, { useState, useEffect } from "react";
import axios from "axios";
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const raw = res.data.chartData;
      const xData = res.data.xData || raw.labels;
      const yData = res.data.yData || raw.datasets?.[0]?.data || [];
      const zData = chartType.includes("3D")
        ? res.data.zData && res.data.zData.length > 0
          ? res.data.zData
          : yData
        : [];

      const colors = raw.labels.map(
        () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
      );

      const dataset = {
        ...raw.datasets[0],
        backgroundColor: colors,
        borderColor: colors,
        pointBackgroundColor: colors,
        showLine: chartType === "Line Chart",
        tension: 0.4,
      };

      const updatedChartData = {
        labels: raw.labels,
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
    } catch (error) {
      console.error(error);
      alert("Error generating chart.");
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/analysis/save",
        {
          fileId: selectedFile,
          xAxis,
          yAxis,
          zAxis: chartType.includes("3D") ? zAxis : null,
          chartTitle,
          chartType,
          chartData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Analysis saved!");
    } catch (error) {
      console.error(error);
      alert("Error saving analysis.");
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
      />
    );

  default:
    return <p>Unsupported chart type</p>;
}
  };

  return (
    <div className="chart-page">
      <div className="chart-container">
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
              <select value={zAxis} onChange={(e) => setZAxis(e.target.value)}>
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
          <button onClick={generateSummary}>Generate AI Summary</button>
        </div>

  <div className="chart-page">
  <div className="main-wrapper">
    <div className="chart-container">
     
      <div className="left-column">
        <div className="chart-form"></div>
      </div>

      <div className="right-column">
        <div className="chart-display">{renderChart()}</div>
      </div>
    </div>

    {summary && (
      <div className="ai-summary-section">
        <h3>🧠 AI Summary</h3>
        <p>{summary}</p>
      </div>
    )}
  </div>
</div>



      </div>
    </div>
  );
};

export default ChartPage;
