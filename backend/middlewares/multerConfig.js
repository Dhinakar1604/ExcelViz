const multer = require('multer');
const path = require('path');
const excelStorage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const excelFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== '.xls' && ext !== '.xlsx') {
    return cb(new Error('Only Excel files are allowed'), false);
  }
  cb(null, true);
};

const pdfStorage = multer.memoryStorage();

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files are allowed'), false);
  }
  cb(null, true);
};

module.exports = {
  uploadExcel: multer({ storage: excelStorage, fileFilter: excelFileFilter }),
  uploadPDF: multer({ storage: pdfStorage, fileFilter: pdfFileFilter }),
};
