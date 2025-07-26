const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const chartController = require("../controllers/chartController"); // ✅ ADD THIS LINE

router.post('/generate', protect, chartController.generateChart);
router.post('/save', protect, chartController.saveChartConfig);
router.get('/history', protect, chartController.getUserHistory);

module.exports = router;
