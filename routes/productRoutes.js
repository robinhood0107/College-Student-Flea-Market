const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /product/list - 상품 목록 페이지
router.get('/list', productController.list || ((req, res) => {
    res.render('product/list', { products: [] });
}));

// GET /product/write - 상품 등록 페이지
router.get('/write', productController.getWritePage || ((req, res) => {
    res.render('product/write');
}));

// POST /product/write - 상품 등록 처리
router.post('/write', productController.create || ((req, res) => {
    res.redirect('/product/list');
}));

// GET /product/:id/edit - 상품 수정 페이지
router.get('/:id/edit', productController.getEditPage || ((req, res) => {
    res.render('product/write', { product: null });
}));

// POST /product/:id/edit - 상품 수정 처리
router.post('/:id/edit', productController.update || ((req, res) => {
    res.redirect(`/product/${req.params.id}`);
}));

// POST /product/:id/status - 상품 상태 변경
router.post('/:id/status', productController.updateStatus || ((req, res) => {
    res.redirect(`/product/${req.params.id}`);
}));

// POST /product/:id/comment - 댓글 작성
router.post('/:id/comment', productController.createComment || ((req, res) => {
    res.redirect(`/product/${req.params.id}`);
}));

// POST /product/:id/comment/:commentId/reply - 답글 작성
router.post('/:id/comment/:commentId/reply', productController.createReply || ((req, res) => {
    res.redirect(`/product/${req.params.id}`);
}));

// POST /product/:id/like - 찜하기
router.post('/:id/like', productController.toggleLike || ((req, res) => {
    res.json({ success: true });
}));

// DELETE /product/:id - 상품 삭제
router.delete('/:id', productController.delete || ((req, res) => {
    res.redirect('/product/list');
}));

// GET /product/:id - 상품 상세 페이지 (가장 마지막에 위치 - 다른 라우트와 충돌 방지)
router.get('/:id', productController.detail || ((req, res) => {
    res.render('product/detail', { 
        product: null,
        comments: []
    });
}));

module.exports = router;
