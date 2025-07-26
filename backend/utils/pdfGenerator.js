const PDFDocument = require("pdfkit");
const fs = require("fs");

/**
 * Saves chart data to a PDF.
 * @param {string} outputPath
 * @param {string} chartTitle
 * @param {Buffer} imageBuffer
 */
function generateChartPDF(outputPath, chartTitle, imageBuffer) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(outputPath));

  doc.fontSize(18).text(chartTitle, { align: "center" });
  doc.image(imageBuffer, {
    fit: [500, 400],
    align: "center",
    valign: "center"
  });

  doc.end();
}

module.exports = generateChartPDF;
