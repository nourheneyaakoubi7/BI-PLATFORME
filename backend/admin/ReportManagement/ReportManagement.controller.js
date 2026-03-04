const ReportManagement = require('./ReportManagement.model');

// Get all reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await ReportManagement.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reports', error: err.message });
  }
};

// Get report by ID
exports.getReportById = async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await ReportManagement.findById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching report', error: err.message });
  }
};

// Create new report
exports.createReport = async (req, res) => {
  try {
    const { title, description, reportType, dataSource } = req.body;
    const newReport = new ReportManagement({ title, description, reportType, dataSource });
    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(400).json({ message: 'Error creating report', error: err.message });
  }
};

// Update report
exports.updateReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    const updates = req.body;
    const updatedReport = await ReportManagement.findByIdAndUpdate(reportId, updates, { new: true });
    if (!updatedReport) return res.status(404).json({ message: 'Report not found' });
    res.json(updatedReport);
  } catch (err) {
    res.status(400).json({ message: 'Error updating report', error: err.message });
  }
};

// Delete report
exports.deleteReport = async (req, res) => {
  try {
    const reportId = req.params.id;
    await ReportManagement.findByIdAndDelete(reportId);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting report', error: err.message });
  }
};