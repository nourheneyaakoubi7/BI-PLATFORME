const express = require('express');
const router = express.Router();
const fileUploadController = require('./fileupload.controller');
const { verifyToken } = require('../auth/auth.middleware');

router.post('/', verifyToken, fileUploadController.uploadFile);
router.get('/', verifyToken, fileUploadController.getUserFiles);
router.get('/content/:id', verifyToken, fileUploadController.getFileContent);
router.put('/:id', verifyToken, fileUploadController.updateFile);
router.get('/download/:id', verifyToken, fileUploadController.downloadFile);
router.post('/new', verifyToken, fileUploadController.createNewFile);
router.delete('/:id', verifyToken, fileUploadController.deleteFile);

module.exports = router;