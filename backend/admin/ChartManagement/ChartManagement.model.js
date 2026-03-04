const mongoose = require('mongoose');

const chartManagementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    chartType: { type: String, required: true }, // e.g., bar, line, pie
    dataSource: { type: String }, // e.g., API endpoint or data reference
    xAxis: { type: String },
    yAxis: { type: String },
    options: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const ChartManagement = mongoose.model('ChartManagement', chartManagementSchema);
module.exports = ChartManagement;