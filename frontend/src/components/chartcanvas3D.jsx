import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";

const ChartCanvas3D = ({ chartType, chartData, chartTitle }) => {
  const plotRef = useRef(null);

  useEffect(() => {
    if (
      !plotRef.current ||
      !chartData?.xData ||
      !chartData?.yData ||
      !chartData?.zData
    ) {
      console.warn("Chart not rendered: missing DOM node or data.");
      return;
    }

    const isLineChart = chartType.toLowerCase().includes("line");

    let traces = [];

    if (isLineChart) {
      // ✅ 3D Line Chart
      traces = [
        {
          type: "scatter3d",
          mode: "lines+markers",
          x: chartData.xData,
          y: chartData.yData,
          z: chartData.zData,
          marker: {
            size: 6,
            color: chartData.zData,
            colorscale: "Turbo", // Versatile and vibrant
            opacity: 0.9,
          },
          line: {
            width: 4,
            color: chartData.zData,
            colorscale: "Turbo",
          },
        },
      ];
    } else {
      // ✅ 3D Bar Simulation using vertical lines
      traces = chartData.xData.map((x, i) => ({
        type: "scatter3d",
        mode: "lines+markers",
        x: [x, x],
        y: [chartData.yData[i], chartData.yData[i]],
        z: [0, chartData.zData[i]],
        line: {
          width: 8,
          color: chartData.zData[i],
          colorscale: "Turbo",
        },
        marker: {
          size: 3,
          color: chartData.zData[i],
          colorscale: "Turbo",
        },
      }));
    }

    const layout = {
      title: chartTitle || "3D Chart",
      autosize: true,
      scene: {
        xaxis: { title: "X Axis", gridcolor: "#444", zerolinecolor: "#888" },
        yaxis: { title: "Y Axis", gridcolor: "#444", zerolinecolor: "#888" },
        zaxis: { title: "Z Axis", gridcolor: "#444", zerolinecolor: "#888" },
        bgcolor: "rgba(0,0,0,0.05)",
      },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      margin: { l: 0, r: 0, b: 0, t: 60 },
      font: {
        color: "#e2e8f0",
        family: "Segoe UI, sans-serif",
      },
    };

    Plotly.newPlot(plotRef.current, traces, layout, {
      responsive: true,
      displaylogo: false,
    });

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [chartType, chartData, chartTitle]);

  return (
    <div
      ref={plotRef}
      style={{
        width: "100%",
        height: "500px",
        backgroundColor: "transparent",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
};

export default ChartCanvas3D;
