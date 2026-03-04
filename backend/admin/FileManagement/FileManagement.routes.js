const express = require('express');
const router = express.Router();

const {
    uploadFile,
    getUserFiles,
    getFileContent,
    updateFile,
    downloadFile,
    deleteFile
} = require('./FileManagement.controller');
const { verifyAdmin } = require('../../auth/auth.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

console.log('uploadFile type:', typeof uploadFile); 

router.post('/', verifyAdmin, upload.single('file'), uploadFile);
router.get('/', verifyAdmin, getUserFiles);
router.get('/content/:id', verifyAdmin, getFileContent);
router.put('/:id', verifyAdmin, updateFile);
router.get('/download/:id', verifyAdmin, downloadFile);
router.delete('/:id', verifyAdmin, deleteFile);

module.exports = router;