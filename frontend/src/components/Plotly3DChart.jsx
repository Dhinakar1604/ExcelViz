import React from "react";
import Plot from "react-plotly.js";

const Plotly3DChart = ({ type, labels, values, title }) => {
  if (!labels || !values) return <p>No data</p>;

  if (type === "3D Bar Chart") {
    return (
      <Plot
        data={[
          {
            type: "mesh3d",
            x: labels,
            y: values,
            z: values.map(() => 1),
            opacity: 0.8,
            color: "skyblue",
          },
        ]}
        layout={{
          title,
          scene: {
            xaxis: { title: "X-Axis" },
            yaxis: { title: "Y-Axis" },
            zaxis: { title: "Value" },
          },
          paper_bgcolor: "#1c1c3c",
          font: { color: "#fff" },
        }}
      />
    );
  }

  if (type === "3D Line Chart") {
    return (
      <Plot
        data={[
          {
            type: "scatter3d",
            mode: "lines+markers",
            x: labels,
            y: values,
            z: values,
            marker: { size: 4, color: "orange" },
            line: { color: "orange" },
          },
        ]}
        layout={{
          title,
          scene: {
            xaxis: { title: "X-Axis" },
            yaxis: { title: "Y-Axis" },
            zaxis: { title: "Value" },
          },
          paper_bgcolor: "#1c1c3c",
          font: { color: "#fff" },
        }}
      />
    );
  }

  if (type === "3D Pie Chart") {
    return (
      <Plot
        data={[
          {
            type: "pie",
            labels,
            values,
            hole: 0.3,
            marker: {
              colors: labels.map(
                (_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`
              ),
            },
          },
        ]}
        layout={{
          title,
          paper_bgcolor: "#1c1c3c",
          font: { color: "#fff" },
        }}
      />
    );
  }

  return <p style={{ color: "#fff" }}>Unsupported 3D Chart Type</p>;
};

export default Plotly3DChart;
