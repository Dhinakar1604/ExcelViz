const XLSX = require("xlsx");

/**
 * Parses an Excel file (buffer) and returns an array of sheet data in JSON format.
 * @param {Buffer} fileBuffer - The buffer of the uploaded Excel file.
 * @returns {Object[]} - Array of row objects.
 */
function parseExcelFile(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return jsonData;
}

module.exports = parseExcelFile;
