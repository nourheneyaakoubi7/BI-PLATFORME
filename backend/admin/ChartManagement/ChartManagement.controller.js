const ChartManagement = require('./ChartManagement.model');

// Get all charts
exports.getAllCharts = async (req, res) => {
  try {
    const charts = await ChartManagement.find();
    res.json(charts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching charts', error: err.message });
  }
};

// Get chart by ID
exports.getChartById = async (req, res) => {
  try {
    const chartId = req.params.id;
    const chart = await ChartManagement.findById(chartId);
    if (!chart) return res.status(404).json({ message: 'Chart not found' });
    res.json(chart);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chart', error: err.message });
  }
};


// Update chart
exports.updateChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    const updates = req.body;
    const updatedChart = await ChartManagement.findByIdAndUpdate(chartId, updates, { new: true });
    if (!updatedChart) return res.status(404).json({ message: 'Chart not found' });
    res.json(updatedChart);
  } catch (err) {
    res.status(400).json({ message: 'Error updating chart', error: err.message });
  }
};

// Delete chart
exports.deleteChart = async (req, res) => {
  try {
    const chartId = req.params.id;
    await ChartManagement.findByIdAndDelete(chartId);
    res.json({ message: 'Chart deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting chart', error: err.message });
  }
};