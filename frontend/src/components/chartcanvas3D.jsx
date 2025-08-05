import React, { useEffect } from "react";
import Plotly from "plotly.js-dist-min";

const ChartCanvas3D = ({ chartType, chartData, chartTitle, plotlyRef }) => {
  useEffect(() => {
    if (
      !plotlyRef?.current ||
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
            colorscale: "Turbo",
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
      title: {
        text: chartTitle || "3D Chart",
        font: {
          size: 20,
          color: "#000", // Black title for export clarity
        },
      },
      autosize: true,
      scene: {
        xaxis: {
          title: "X Axis",
          titlefont: { color: "#000" },
          tickfont: { color: "#000" },
          gridcolor: "#ccc",
          zerolinecolor: "#aaa",
        },
        yaxis: {
          title: "Y Axis",
          titlefont: { color: "#000" },
          tickfont: { color: "#000" },
          gridcolor: "#ccc",
          zerolinecolor: "#aaa",
        },
        zaxis: {
          title: "Z Axis",
          titlefont: { color: "#000" },
          tickfont: { color: "#000" },
          gridcolor: "#ccc",
          zerolinecolor: "#aaa",
        },
        bgcolor: "#fff", // White scene background
      },
      paper_bgcolor: "#fff", // White paper background
      plot_bgcolor: "#fff",
      font: {
        color: "#000", // Black font for readability
        family: "Segoe UI, sans-serif",
      },
      margin: { l: 0, r: 0, b: 0, t: 60 },
    };

    Plotly.newPlot(plotlyRef.current, traces, layout, {
      responsive: true,
      displaylogo: false,
    });

    return () => {
      if (plotlyRef.current) {
        Plotly.purge(plotlyRef.current);
      }
    };
  }, [chartType, chartData, chartTitle, plotlyRef]);

  return (
    <div
      ref={plotlyRef}
      style={{
        width: "100%",
        height: "500px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
};

export default ChartCanvas3D;
