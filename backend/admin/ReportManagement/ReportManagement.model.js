const mongoose = require('mongoose');

const reportManagementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  reportType: { type: String, required: true }, // e.g., PDF, Excel, Word
  dataSource: { type: String }, // link or reference to data used
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ReportManagement = mongoose.model('ReportManagement', reportManagementSchema);
module.exports = ReportManagement;