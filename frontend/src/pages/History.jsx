import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Chart from "chart.js/auto";
import ChartCanvas3D from "../components/chartcanvas3D"; // if you have this for 3D charts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/History.css";
const History = () => {
  const navigate = useNavigate();

  // Files & charts data
  const [historyFiles, setHistoryFiles] = useState([]);
  const [savedCharts, setSavedCharts] = useState([]);

  // Loading states
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal state for chart view
  const [selectedChart, setSelectedChart] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const chartContainerRef = useRef(null);

  // Modal state for file view (optional)
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch uploaded files
    const fetchHistoryFiles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/upload/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setHistoryFiles(data.files || []);
      } catch (error) {
        console.error("Fetch history files error:", error);
      } finally {
        setLoadingFiles(false);
      }
    };

    // Fetch saved charts
    const fetchSavedCharts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/analysis/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSavedCharts(data.history || []);
      } catch (error) {
        console.error("Fetch saved charts error:", error);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchHistoryFiles();
    fetchSavedCharts();
  }, [navigate]);

  // Chart rendering effect (for selected chart)
  useEffect(() => {
    if (!selectedChart) return;

    if (selectedChart.chartType.toLowerCase().includes("3d")) {
      // We do not render 2d chart here if 3d (handled by ChartCanvas3D component)
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      return;
    }

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const typeMap = {
      "pie chart": "pie",
      "bar chart": "bar",
      "line chart": "line",
      "doughnut chart": "doughnut",
    };

    const chartType = typeMap[selectedChart.chartType.toLowerCase()] || selectedChart.chartType.toLowerCase();

    chartInstance.current = new Chart(chartRef.current, {
      type: chartType,
      data: selectedChart.chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#e2e8f0" } },
          title: {
            display: true,
            text: selectedChart.chartTitle || "Analysis Chart",
            color: "#f8fafc",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: selectedChart.xAxis || "X Axis",
              color: "#f8fafc",
              font: { size: 14, weight: "bold" },
            },
            ticks: { color: "#e2e8f0" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
          y: {
            title: {
              display: true,
              text: selectedChart.yAxis || "Y Axis",
              color: "#f8fafc",
              font: { size: 14, weight: "bold" },
            },
            ticks: { color: "#e2e8f0" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
        },
      },
    });
  }, [selectedChart]);

  // Download handlers for chart modal
  const handleDownloadPNG = async () => {
    if (!chartContainerRef.current) return alert("Chart container not available");
    try {
      const canvas = await html2canvas(chartContainerRef.current, { backgroundColor: null });
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${selectedChart.chartTitle || "chart"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download PNG", err);
      alert("Failed to download PNG");
    }
  };

  const handleDownloadPDF = async () => {
    if (!chartContainerRef.current) return alert("Chart container not available");
    try {
      const canvas = await html2canvas(chartContainerRef.current, { backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${selectedChart.chartTitle || "chart"}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to download PDF");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div
        className="history-container"
        style={{
          flex: 1,
          marginLeft: isSidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
          padding: 20,
          color: "#e2e8f0",
        }}
      >
        <h1>📂 Your Upload History</h1>
        {loadingFiles ? (
          <p>Loading your files...</p>
        ) : historyFiles.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Uploaded At</th>
                <th>Size (KB)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyFiles.map((file, idx) => (
                <tr key={idx}>
                  <td>{file.name}</td>
                  <td>{new Date(file.uploadedAt).toLocaleDateString()}</td>
                  <td>{file.size ? (file.size / 1024).toFixed(2) : "N/A"}</td>
                  <td>
                    <button
                      onClick={() => setSelectedFile(file)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h1 style={{ marginTop: 40 }}>📊 Your Saved Charts</h1>
        {loadingCharts ? (
          <p>Loading your charts...</p>
        ) : savedCharts.length === 0 ? (
          <p>No saved charts yet.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Chart Title</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedCharts.map((chart, idx) => (
                <tr key={idx}>
                  <td>{chart.chartTitle || "Untitled Chart"}</td>
                  <td>{new Date(chart.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => setSelectedChart(chart)}
                      className="btn-view"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Chart Modal */}
        {selectedChart && (
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chart-modal-title"
            tabIndex={-1}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              overflowY: "auto",
              padding: 20,
            }}
            onClick={(e) => {
              if (e.target.classList.contains("modal")) {
                setSelectedChart(null);
              }
            }}
          >
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "90%",
                maxHeight: "90%",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <h2 id="chart-modal-title" style={{ marginBottom: 10 }}>
                {selectedChart.chartTitle || "Chart"}
              </h2>

              <div
                ref={chartContainerRef}
                style={{
                  width: "100%",
                  height: "500px",
                  overflow: "auto",
                  backgroundColor: "#0f172a",
                  padding: 10,
                  borderRadius: 8,
                }}
              >
                {selectedChart.chartType.toLowerCase().includes("3d") ? (
                  <ChartCanvas3D
                    chartTitle={selectedChart.chartTitle}
                    chartType={selectedChart.chartType}
                    chartData={selectedChart.chartData}
                    plotlyRef={null} // If needed, add a ref here
                  />
                ) : (
                  <canvas
                    ref={chartRef}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxHeight: "500px",
                      display: "block",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <button onClick={handleDownloadPNG} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Download PNG
                </button>
                <button onClick={handleDownloadPDF} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Download PDF
                </button>
                <button onClick={() => setSelectedChart(null)} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Modal - basic info or add your own design */}
        {selectedFile && (
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="file-modal-title"
            tabIndex={-1}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: 20,
            }}
            onClick={(e) => {
              if (e.target.classList.contains("modal")) {
                setSelectedFile(null);
              }
            }}
          >
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "400px",
                width: "100%",
                boxSizing: "border-box",
                color: "#e2e8f0",
                textAlign: "center",
              }}
            >
              <h2 id="file-modal-title" style={{ marginBottom: 15 }}>
                File Info
              </h2>
              <p><strong>Name:</strong> {selectedFile.name}</p>
              <p><strong>Uploaded At:</strong> {new Date(selectedFile.uploadedAt).toLocaleString()}</p>
              <p><strong>Size:</strong> {selectedFile.size ? (selectedFile.size / 1024).toFixed(2) + " KB" : "N/A"}</p>
              <button onClick={() => setSelectedFile(null)} style={{ marginTop: 20, padding: "8px 16px", cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
