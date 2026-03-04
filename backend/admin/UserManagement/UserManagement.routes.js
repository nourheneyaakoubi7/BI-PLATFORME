const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('./UserManagement.controller');
const { verifyAdmin } = require('../../auth/auth.middleware');

router.get('/', verifyAdmin, getAllUsers);
router.get('/:id', verifyAdmin, getUserById);
router.post('/', verifyAdmin, createUser);
router.put('/:id', verifyAdmin, updateUser);
router.delete('/:id', verifyAdmin, deleteUser);

module.exports = router;