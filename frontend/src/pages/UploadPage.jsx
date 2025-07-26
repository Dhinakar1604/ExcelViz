import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // for preview
import "../styles/UploadPage.css";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewData, setPreviewData] = useState([]); // for preview
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setUploadStatus("");

    // ✅ Generate Excel preview
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setPreviewData(json.slice(0, 5)); // show first 5 rows
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("❌ Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadStatus("✅ File uploaded successfully!");
      setSelectedFile(null);

      // ✅ Remove immediate redirect; user will manually navigate after confirmation
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("❌ Upload failed. Try again.");
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2>Upload Excel File</h2>
        <p>Upload your Excel file (.xls or .xlsx) to analyze and visualize your data</p>

        <label className="file-drop-area">
          <span className="upload-icon">📤</span>
          <span className="upload-instructions">
            {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop or click to select a file"}
          </span>
          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>

        <button className="upload-btn" onClick={handleUpload}>
          Upload File
        </button>

        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}

        {/* ✅ Show Excel preview table */}
        {previewData.length > 0 && (
          <div className="preview-table">
            <h3>📊 Preview of Uploaded File</h3>
            <table>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Show "Go to Dashboard" after success */}
        {uploadStatus.includes("success") && (
          <button
            className="upload-btn"
            style={{ marginTop: "10px" }}
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
