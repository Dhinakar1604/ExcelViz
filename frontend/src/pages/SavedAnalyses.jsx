import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Chart from "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../styles/SavedAnalyses.css";
import ChartCanvas3D from "../components/chartcanvas3D";

const SavedAnalyses = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // This ref wraps the entire chart container for html2canvas capture (works for both 2D & 3D)
  const chartContainerRef = useRef(null);

  // This ref is for 2D Chart.js canvas only
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/analysis/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAnalyses(data.history || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyses();
  }, []);

  // Initialize 2D Chart.js charts only
  useEffect(() => {
    if (!selectedAnalysis || selectedAnalysis.chartType.toLowerCase().includes("3d")) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const typeMap = {
      "pie chart": "pie",
      "bar chart": "bar",
      "line chart": "line",
      "doughnut chart": "doughnut",
    };
    const chartType = typeMap[selectedAnalysis.chartType.toLowerCase()] || selectedAnalysis.chartType.toLowerCase();

    chartInstance.current = new Chart(chartRef.current, {
      type: chartType,
      data: selectedAnalysis.chartData,
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#e2e8f0" } },
          title: {
            display: true,
            text: selectedAnalysis.chartTitle || "Analysis Chart",
            color: "#f8fafc",
          },
        },
        scales: {
          x: {
            ticks: { color: "#e2e8f0" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
          y: {
            ticks: { color: "#e2e8f0" },
            grid: { color: "rgba(255,255,255,0.1)" },
          },
        },
      },
    });
  }, [selectedAnalysis]);

  // Download handlers capture the entire chart container
  const handleDownloadPNG = async () => {
    if (!chartContainerRef.current) return alert("Chart container not available");
    try {
      const canvas = await html2canvas(chartContainerRef.current, { backgroundColor: null });
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${selectedAnalysis.chartTitle || "chart"}.png`;
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
      pdf.save(`${selectedAnalysis.chartTitle || "chart"}.pdf`);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to download PDF");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/analysis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((a) => a._id !== id));
        setDeleteId(null);
        if (selectedAnalysis?._id === id) setSelectedAnalysis(null);
      } else {
        console.error("Failed to delete analysis.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="saved-analyses-container" style={{ flex: 1, padding: "20px", color: "#e2e8f0" }}>
        <header className="dashboard-header">
          <button onClick={() => setIsSidebarOpen(true)} className="sidebar-toggle-button" aria-label="Open sidebar">
            ☰
          </button>
          <div className="logo-title saved-analyses-title">📊 Saved Analyses</div>
        </header>

        <main>
          {loading ? (
            <p>Loading your analyses...</p>
          ) : analyses.length === 0 ? (
            <p>No analyses saved yet.</p>
          ) : (
            <div className="analyses-list">
              {analyses.map((analysis) => (
                <div key={analysis._id} className="analysis-card" style={{ marginBottom: "15px" }}>
                  <h3>{analysis.chartTitle || "Untitled Chart"}</h3>
                  <p>Type: {analysis.chartType}</p>
                  <button onClick={() => setSelectedAnalysis(analysis)} style={{ marginRight: "10px" }}>
                    View
                  </button>
                  <button
                    onClick={() => confirmDelete(analysis._id)}
                    style={{ marginRight: "10px", background: "darkred", color: "#fff" }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Modal for viewing chart */}
        {selectedAnalysis && (
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
              // Close modal if clicking outside content box
              if (e.target.classList.contains("modal")) {
                setSelectedAnalysis(null);
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
                {selectedAnalysis.chartTitle || "Chart"}
              </h2>

              <div
                ref={chartContainerRef}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  overflow: "auto",
                  backgroundColor: "#0f172a",
                  padding: 10,
                  borderRadius: 4,
                }}
              >
                {selectedAnalysis.chartType.toLowerCase().includes("3d") ? (
                  <ChartCanvas3D
                    chartTitle={selectedAnalysis.chartTitle}
                    chartType={selectedAnalysis.chartType}
                    chartData={selectedAnalysis.chartData}
                  />
                ) : (
                  <canvas ref={chartRef} />
                )}
              </div>

              <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
                <button onClick={handleDownloadPNG} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Download PNG
                </button>
                <button onClick={handleDownloadPDF} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Download PDF
                </button>
                <button onClick={() => setSelectedAnalysis(null)} style={{ padding: "8px 16px", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation dialog */}
        {deleteId && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            tabIndex={-1}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: 20,
            }}
          >
            <div
              style={{
                background: "#1e293b",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
                maxWidth: "90%",
                width: "400px",
                boxSizing: "border-box",
              }}
            >
              <h3 id="delete-dialog-title">Are you sure you want to delete this analysis?</h3>
              <p>This action cannot be undone.</p>
              <div style={{ marginTop: "15px", display: "flex", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleDelete(deleteId)}
                  style={{ background: "darkred", color: "#fff", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setDeleteId(null)}
                  style={{ padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAnalyses;
