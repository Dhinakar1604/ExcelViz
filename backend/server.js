require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Removed morgan cleanly as you do not need it

// Route imports
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chartRoutes = require('./routes/chartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const historyRoutes = require('./routes/historyRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// Middleware imports
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chart', chartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/analysis', analysisRoutes);

// Error handler middleware
app.use(errorHandler);

console.log(`
✅ Routes mounted:
  • /api/auth
  • /api/upload
  • /api/chart
  • /api/admin
  • /api/dashboard
  • /api/history
  • /api/analysis
`);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
};


// Graceful shutdown for Ctrl+C
process.on("SIGINT", async () => {
    console.log("⚠️ SIGINT received. Closing MongoDB connection...");
    await mongoose.connection.close();
    process.exit(0);
});

startServer();
