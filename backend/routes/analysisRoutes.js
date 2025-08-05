const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const { uploadPDF } = require('../middlewares/multerConfig');

const {
  generateChart,
  saveChart,
  getUserChartHistory,
  getUserStats,
  getAnalysisById,
  deleteAnalysisById,
  generateSummary,
  downloadPDFReport
} = require('../controllers/analysisController');

const { uploadPDFReport } = require('../controllers/uploadController');

router.post('/generate', protect, generateChart);
router.post('/save', protect, saveChart);
router.get('/history', protect, getUserChartHistory);
router.get('/user-stats', protect, getUserStats);
router.get('/:id', protect, getAnalysisById);
router.delete('/:id', protect, deleteAnalysisById);
router.post('/summary', protect, generateSummary);
router.post('/download-report', protect, downloadPDFReport); 
router.post('/upload-pdf', protect, uploadPDF.single('pdf'), uploadPDFReport); 

module.exports = router;
