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
import Plotly3DChart from "../components/Plotly3DChart";
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
  const [columns, setColumns] = useState([]);
  const [chartData, setChartData] = useState(null);
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
      const res = await axios.get(`http://localhost:5000/api/upload/columns/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setColumns(res.data.columns);
    } catch (error) {
      console.error(error);
      alert("Error fetching columns.");
    }
  };

  const generateChart = async () => {
    if (!selectedFile || !xAxis || !yAxis) {
      alert("Select file, X, and Y axes.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/analysis/generate",
        { fileId: selectedFile, xAxis, yAxis, chartTitle, chartType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const raw = res.data.chartData;
      const colors = raw.labels.map(
        () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
      );

      const updatedChartData = {
        ...raw,
        datasets: [
          {
            ...raw.datasets[0],
            backgroundColor: colors,
          },
        ],
        options: {
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
            },
            y: {
              ticks: { color: "#ffffff" },
              grid: { color: "rgba(255,255,255,0.1)" },
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

  return (
    <div className="chart-page">
      <div className="chart-container">
        <div className="chart-form">
          <h2>📊 Create & Visualize Your Analysis</h2>

          <label>Select Uploaded Excel File</label>
          <select value={selectedFile} onChange={(e) => setSelectedFile(e.target.value)}>
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
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option>Bar Chart</option>
            <option>Line Chart</option>
            <option>Pie Chart</option>
            <option>Doughnut Chart</option>
            <option>3D Bar Chart</option>
            <option>3D Line Chart</option>
            <option>3D Pie Chart</option>
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

          <button onClick={generateChart} disabled={loading}>
            {loading ? "Generating..." : "Generate Chart"}
          </button>
          <button onClick={saveAnalysis}>Save Analysis</button>
        </div>

        <div className="chart-display">
          {chartData ? (
            <>
              {!chartType.includes("3D") && chartType === "Bar Chart" && (
                <Bar data={chartData} options={chartData.options} />
              )}
              {!chartType.includes("3D") && chartType === "Line Chart" && (
                <Line data={chartData} options={chartData.options} />
              )}
              {!chartType.includes("3D") && chartType === "Pie Chart" && (
                <Pie data={chartData} options={chartData.options} />
              )}
              {!chartType.includes("3D") && chartType === "Doughnut Chart" && (
                <Doughnut data={chartData} options={chartData.options} />
              )}
              {chartType.includes("3D") && (
                <Plotly3DChart
                  type={chartType}
                  labels={chartData.labels}
                  values={chartData.datasets[0].data}
                  title={chartTitle}
                />
              )}
            </>
          ) : (
            <p className="no-chart-text">📈 No Charts Yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
