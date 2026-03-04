// ai.routes.js
const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { verifyToken } = require('../auth/auth.middleware');

router.post('/execute', verifyToken, aiController.executeTool);
router.post('/conversation', verifyToken, aiController.saveConversation);
router.get('/conversation', verifyToken, aiController.getConversation);
router.delete('/conversation', verifyToken, aiController.deleteConversation);

module.exports = router;