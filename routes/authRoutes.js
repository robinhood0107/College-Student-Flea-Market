//라우터 개념 복습
//라우터는 URL 경로와 컨트롤러 함수를 연결해주는 역할
//app.js에서 app.use('/auth', ...)로 연결되어서
//이 파일의 경로(/login, /join 등)가 /auth와 합쳐져서 최종 URL이 됨
//예: /auth + /login = /auth/login

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

//보기 좋게 주석을 달자

//GET  /auth/login  - 로그인 페이지
router.get('/login', authController.getLoginPage);

//POST /auth/login  - 로그인 처리
router.post('/login', authController.login);

//GET  /auth/join   - 회원가입 페이지
router.get('/join', authController.getJoinPage);

//POST /auth/join   - 회원가입 처리
router.post('/join', authController.join);

//GET  /auth/logout - 로그아웃
router.get('/logout', authController.logout);

module.exports = router;
