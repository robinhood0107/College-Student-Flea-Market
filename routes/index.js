//index.js로 보통 홈페이지를 처리 한다고 함.
//알아두기

const express = require('express');
const router = express.Router();

// 메인페이지는 로그인 페이지로 리다이렉트
router.get('/', (req, res) => {
    res.redirect('/auth/login');
});

module.exports = router;
