const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /user/profile - 마이페이지
router.get('/profile', userController.profile || ((req, res) => {
    const tab = req.query.tab || 'sales';
    res.render('user/profile', { 
        user: req.user || null,
        products: [],
        tab: tab
    });
}));

// GET /user/edit - 프로필 수정 페이지
router.get('/edit', userController.getEditPage || ((req, res) => {
    res.render('user/edit', { user: req.user || null });
}));

// POST /user/edit - 프로필 수정 처리
router.post('/edit', userController.update || ((req, res) => {
    res.redirect('/user/profile');
}));

module.exports = router;
