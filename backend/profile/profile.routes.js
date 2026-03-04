const express = require('express');
const { verifyToken } = require('../auth/auth.middleware');
const profileController = require('./profile.controller');

const router = express.Router();

router.get('/', verifyToken, profileController.getProfile); 
router.put('/', verifyToken, profileController.updateProfile); 

module.exports = router;
