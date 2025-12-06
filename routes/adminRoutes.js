const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const isAdmin = require('../middlewares/isAdmin');

// 관리자 대시보드
router.get('/dashboard', isAdmin, adminController.dashboard);

// 전체 회원 목록
router.get('/users', isAdmin, adminController.getUsers);

// 회원 삭제
router.delete('/users/:id', isAdmin, adminController.deleteUser);

// 전체 상품 목록
router.get('/products', isAdmin, adminController.getProducts);

// 상품 삭제
router.delete('/products/:id', isAdmin, adminController.deleteProduct);

module.exports = router;
