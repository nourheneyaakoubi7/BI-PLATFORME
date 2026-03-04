const express = require('express');
const router = express.Router();
const {
    getAllCharts,
    getChartById,
    updateChart,
    deleteChart
} = require('./ChartManagement.controller');
const { verifyAdmin } = require('../../auth/auth.middleware');

router.get('/', verifyAdmin, getAllCharts);
router.get('/:id', verifyAdmin, getChartById);
router.put('/:id', verifyAdmin, updateChart);
router.delete('/:id', verifyAdmin, deleteChart);

module.exports = router;