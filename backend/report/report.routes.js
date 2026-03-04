const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { verifyToken } = require('../auth/auth.middleware');

router.post('/', verifyToken, reportController.createReport);
router.get('/', verifyToken, reportController.getUserReports);
router.get('/:id', verifyToken, reportController.getReportById);
router.delete('/:id', verifyToken, reportController.deleteReport);
router.get('/:id/download', verifyToken, reportController.downloadReport);

module.exports = router;