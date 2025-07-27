const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const analysisController = require('../controllers/analysisController');

router.post('/generate', protect, analysisController.generateChart);
router.post('/save', protect, analysisController.saveChart);

router.get('/history', protect, analysisController.getUserChartHistory)
router.get('/user-stats', protect, analysisController.getUserStats);
router.get('/:id', protect, analysisController.getAnalysisById);
router.delete('/:id', protect, analysisController.deleteAnalysisById);
router.post('/summary', protect, analysisController.generateSummary);

module.exports = router;
