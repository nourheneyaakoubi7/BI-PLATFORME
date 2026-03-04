const mongoose = require('mongoose');
const DashboardStats = require('./dashboard.model');
const FileUpload = require('../fileupload/fileupload.model');
const Chart = require('../charts/charts.model');
const Report = require('../report/report.model'); 
const User = require('../auth/auth.model');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [files, charts, reportsCount, user] = await Promise.all([
      FileUpload.find({ userId }),
      Chart.find({ createdBy: userId }),
      Report.countDocuments({ userId }), 
      User.findById(userId)
    ]);

    // compter les types de graphiques
    const chartTypeCounts = {};
    (charts || []).forEach(c => {
      chartTypeCounts[c.chartType] = (chartTypeCounts[c.chartType] || 0) + 1;
    });

    // calcul KPIs
    const kpis = {
      files: {
        total: files.length,
        avgSize: calculateAvgFileSize(files),
        types: getFileTypes(files)
      },
      charts: {
        total: charts.length,
        typesCount: chartTypeCounts,
        popularTypes: getPopularChartTypes(charts)
      },
      reports: {
        total: reportsCount
      },
      user: {
        lastActivity: user?.lastLogin || new Date(),
        accountAge: calculateAccountAge(user?.createdAt)
      },
      recentActivity: getRecentActivity(files)
    };

    res.json({ ...kpis });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Error generating KPIs', error: err.message });
  }
};

function calculateAvgFileSize(files) {
  if (!files.length) return '0 KB';
  const totalSize = files.reduce((sum, file) => sum + file.fileData.length, 0);
  const avgSize = totalSize / files.length;
  return formatBytes(avgSize);
}

function getFileTypes(files) {
  const types = new Set();
  files.forEach(f => types.add(f.fileType));
  return Array.from(types);
}

function getPopularChartTypes(charts) {
  const countMap = {};
  (charts || []).forEach(c => {
    countMap[c.chartType] = (countMap[c.chartType] || 0) + 1;
  });
  return Object.entries(countMap)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function calculateAccountAge(createdAt) {
  if (!createdAt) return '0 jours';
  const ageInDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
  return `${ageInDays} jours`;
}

function getRecentActivity(files) {
  return files
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(f => ({ filename: f.filename, createdAt: f.createdAt }));
}

function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}