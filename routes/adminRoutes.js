const express = require('express');
const router = express.Router();

// GET /admin/dashboard - 관리자 대시보드
router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard', { 
        stats: null,
        recentProducts: [],
        recentUsers: []
    });
});

module.exports = router;
