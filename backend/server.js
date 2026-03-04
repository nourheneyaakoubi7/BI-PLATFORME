const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config(); 

// Import route modules
const authRoutes = require('./auth/auth.routes');
const profileRoutes = require('./profile/profile.routes');
const settingsRoutes = require("./settings/settings.routes");
const fileUploadRoutes = require('./fileupload/fileupload.routes')
const dashboardRoutes = require('./dashboard/dashboard.routes');
const aiRoutes = require('./ai/ai.routes');
const chartsRoutes = require('./charts/charts.routes');
const reportRoutes = require('./report/report.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', 
  methods: 'GET,PUT,POST,DELETE',         
  allowedHeaders: 'Content-Type, Authorization' 
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/settings", settingsRoutes);
app.use('/api/fileUpload', fileUploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/charts', chartsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
