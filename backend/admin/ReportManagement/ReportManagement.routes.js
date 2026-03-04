const express = require('express');
const router = express.Router();
const {
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport
} = require('./ReportManagement.controller');
const { verifyAdmin } = require('../../auth/auth.middleware');

router.get('/', verifyAdmin, getAllReports);
router.get('/:id', verifyAdmin, getReportById);
router.post('/', verifyAdmin, createReport);
router.put('/:id', verifyAdmin, updateReport);
router.delete('/:id', verifyAdmin, deleteReport);

module.exports = router;