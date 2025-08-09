const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate a complete PDF report with chart, summary, and top rows from Excel data.
 * @param {string} outputPath - Absolute path to save PDF
 * @param {string} chartTitle - Title of the chart
 * @param {Buffer|string} imageBuffer - Chart image (Buffer or base64 string)
 * @param {string} summary - AI summary text
 * @param {Array<Object>} dataTable - Parsed Excel rows (JSON array)
 */
function generateChartPDF(outputPath, chartTitle, imageBuffer, summary, dataTable) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // 🔲 Page Border
  const drawPageBorder = () => {
    doc.rect(
      doc.page.margins.left - 10,
      doc.page.margins.top - 20,
      doc.page.width - doc.page.margins.left - doc.page.margins.right + 20,
      doc.page.height - doc.page.margins.top - doc.page.margins.bottom + 40
    )
    .lineWidth(1)
    .strokeColor("#333")
    .stroke();
  };

  drawPageBorder();
  doc.on("pageAdded", drawPageBorder);

  // 📌 Header Logo and Title
  const logoPath = path.join(__dirname, "../assets/logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 60 });
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor("#333333")
      .text("ExcelViz Analytics", 120, 55);
  }

  doc.moveDown(3);

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#003366")
    .text(chartTitle || "Untitled Chart", { align: "center" })
    .moveDown(1.5);


  if (imageBuffer) {
    try {
      const image =
        Buffer.isBuffer(imageBuffer)
          ? imageBuffer
          : Buffer.from(imageBuffer.toString("base64"), "base64");

      doc.image(image, {
        fit: [400, 250], 
        align: "center",
        valign: "center",
      });

      doc.moveDown(2);
    } catch (err) {
      console.error("⚠️ Error embedding chart image:", err);
      doc
        .font("Helvetica-Oblique")
        .fillColor("#cc0000")
        .fontSize(12)
        .text("⚠️ Chart image could not be displayed.", { align: "center" })
        .moveDown(2);
    }
  } else {
    doc
      .font("Helvetica-Oblique")
      .fillColor("#cc0000")
      .fontSize(12)
      .text("⚠️ Chart image not provided.", { align: "center" })
      .moveDown(2);
  }

  if (summary) {
    const cleanSummary = summary.replace(/[^\x00-\x7F]/g, " ");
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#000000")
      .text("AI-Generated Summary", { underline: true })
      .moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#111111")
      .text(cleanSummary.trim(), {
        align: "left",
        lineGap: 5,
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      });

    doc.moveDown(2);
  }

  if (Array.isArray(dataTable) && dataTable.length > 0) {
    const headers = Object.keys(dataTable[0]);
    const maxRows = Math.min(10, dataTable.length);
    const maxCols = headers.length;
    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = usableWidth / maxCols;
    const cellPadding = 5;
    const startX = doc.page.margins.left;
    let y = doc.y;

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#000000")
      .text("Source Excel Data (Top 10 Rows)", { underline: true })
      .moveDown(1);


    headers.forEach((key, i) => {
      doc
        .rect(startX + i * colWidth, y, colWidth, 20)
        .fillAndStroke("#dfe6e9", "#000")
        .fillColor("#000")
        .fontSize(10)
        .text(key, startX + i * colWidth + cellPadding, y + 6, {
          width: colWidth - cellPadding * 2,
          ellipsis: true,
        });
    });

    y += 20;

   
    for (let r = 0; r < maxRows; r++) {
      const row = dataTable[r];
      headers.forEach((key, i) => {
        const value = row[key] !== undefined ? String(row[key]) : "";
        doc
          .rect(startX + i * colWidth, y, colWidth, 20)
          .stroke()
          .fillColor("#000")
          .font("Helvetica")
          .fontSize(10)
          .text(value, startX + i * colWidth + cellPadding, y + 6, {
            width: colWidth - cellPadding * 2,
            ellipsis: true,
          });
      });
      y += 20;
    }
  }

  doc.end();

  stream.on("finish", () => {
    console.log(`✅ PDF generated at: ${outputPath}`);
  });
}

module.exports = generateChartPDF;
