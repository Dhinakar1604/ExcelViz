const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const protect = require('../middlewares/authMiddleware');
router.post('/generate-summary', protect, aiController.generateSummary);

module.exports = router;
