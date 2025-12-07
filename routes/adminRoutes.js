const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middlewares/isAdmin');

// 관리자 대시보드
router.get('/dashboard', isAdmin, adminController.dashboard);

module.exports = router;
