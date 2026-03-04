const express = require('express');
const router = express.Router();
const chartsController = require('./charts.controller');
const { verifyToken } = require('../auth/auth.middleware');

router.post('/', verifyToken, chartsController.createChart);
router.get('/', verifyToken, chartsController.getUserCharts);
router.get('/:id', verifyToken, chartsController.getChartById);
router.put('/:id', verifyToken, chartsController.updateChart);
router.delete('/:id', verifyToken, chartsController.deleteChart);
router.get('/:id/data', verifyToken, chartsController.getChartData);

module.exports = router;