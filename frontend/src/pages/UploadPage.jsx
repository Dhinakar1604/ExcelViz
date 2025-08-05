import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/UploadPage.css";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setIsUploaded(false);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setPreviewData(json.slice(0, 5));
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file before uploading.", {
        theme: "dark",
      });
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

      toast.success("File uploaded successfully!", {
        theme: "dark",
        autoClose: 3000,
      });

      setSelectedFile(null);
      setIsUploaded(true);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Try again.", { theme: "dark" });
    }
  };

  return (
    <div className="upload-container">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
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

            {/* ✅ Place the Go to Dashboard button after the table */}
            {isUploaded && (
              <button
                className="upload-btn"
                onClick={() => navigate("/dashboard")}
                style={{ marginTop: "20px" }}
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
