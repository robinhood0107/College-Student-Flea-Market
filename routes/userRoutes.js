const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /user/profile - 마이페이지
router.get('/profile', userController.profile);

// POST /user/edit - 프로필 수정 처리
router.post('/edit', userController.update);

module.exports = router;
