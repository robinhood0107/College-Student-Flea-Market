const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');

// GET /user/profile - 마이페이지
router.get('/profile', userController.profile);

// POST /user/edit - 프로필 수정 처리
router.post('/edit', userController.update);

// POST /user/profile-image - 프로필 이미지 업로드
router.post('/profile-image', upload.single('profile_img'), userController.uploadProfileImage);

module.exports = router;
