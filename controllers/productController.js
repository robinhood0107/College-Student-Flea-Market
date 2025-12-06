const Product = require('../models/Product');
const User = require('../models/User');
const db = require('../config/db');

const categoryMap = {
    "Electronics": "디지털기기",
    "Books": "도서",
    "Furniture": "가구/인테리어",
    "Dorm Essentials": "생활가전",
    "Clothing": "의류"
};



/**
 * 상품 목록 조회
 */
exports.list = async (req, res) => {
    try {
        let { category, keyword, status, page = 1 } = req.query;

        // 영어 카테고리 → 한글로 매핑
        if (category && categoryMap[category]) {
            category = categoryMap[category];
        }

        const limit = 20;
        const offset = (page - 1) * limit;

        const products = await Product.findAll({
            category,
            keyword,
            status,
            limit,
            offset
        }, req.user ? req.user.id : null);

        return res.render('product/list', { products, category, keyword, status, page });
    } catch (error) {
        console.error(error);
        res.status(500).send("상품 목록 오류");
    }
};

/**
 * 상품 등록 페이지
 */
exports.getWritePage = (req, res) => {
    return res.render('product/write');
};

/**
 * 상품 등록 처리
 */
exports.create = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const { title, price, category, description, location } = req.body;

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        await Product.create(
            { seller_id, title, price: parseInt(price), category, description, location },
            imagePath ? [imagePath] : []
        );

        return res.redirect('/product/list');
    } catch (error) {
        console.error("상품 등록 오류:", error);
        res.status(500).send("상품 등록 중 오류 발생");
    }
};

/**
 * 상품 수정 페이지
 */
exports.getEditPage = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).redirect('/auth/login');
        }

        const id = req.params.id;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).send("상품을 찾을 수 없습니다.");
        }

        // 판매자 본인 확인 (보안)
        if (product.seller_id !== req.user.id) {
            return res.status(403).send("권한이 없습니다.");
        }

        return res.render('product/write', { product });
    } catch (error) {
        console.error("상품 수정 페이지 오류:", error);
        return res.status(500).send("상품 수정 페이지 로드 중 오류 발생");
    }
};

/**
 * 상품 수정 처리
 */
exports.update = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).redirect('/auth/login');
        }

        const id = req.params.id;
        const { title, price, category, description, location } = req.body;

        // 상품 존재 및 권한 확인
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send("상품을 찾을 수 없습니다.");
        }

        if (product.seller_id !== req.user.id) {
            return res.status(403).send("권한이 없습니다.");
        }

        // 수정할 데이터 준비
        const updateData = {
            title,
            price: parseInt(price),
            category,
            description,
            location: location || null
        };

        // 이미지가 새로 업로드된 경우
        if (req.file) {
            const newImagePath = `/uploads/${req.file.filename}`;
            
            // 기존 이미지 삭제
            await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
            
            // 새 이미지 추가
            await db.query('INSERT INTO product_images (product_id, image_path) VALUES (?, ?)', [id, newImagePath]);
        }

        // 상품 정보 업데이트
        await Product.update(id, updateData);

        return res.redirect(`/product/${id}`);
    } catch (error) {
        console.error("상품 수정 오류:", error);
        return res.status(500).send("상품 수정 중 오류 발생");
    }
};

/**
 * 상품 상세 페이지
 */
exports.detail = async (req, res) => {
    try {
        const id = req.params.id;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).send("상품을 찾을 수 없습니다.");
        }

        // 판매자 정보
        const seller = await User.findById(product.seller_id);

        return res.render('product/detail', {
            product,
            seller,
            comments: []
        });
    } catch (error) {
        console.error("상품 상세 조회 오류:", error);
        return res.status(500).send("상품 상세 조회 중 오류가 발생했습니다.");
    }
};

exports.toggleLike = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
        }

        const userId = req.user.id;
        const productId = req.params.id;

        const liked = await Product.toggleLike(userId, productId);

        // 좋아요 개수 다시 조회
        const product = await Product.findById(productId);

        const likeCount = await Product.countLikes(productId);

        return res.json({
            success: true,
            liked,
            likeCount
        });

    } catch (error) {
        console.error("찜하기 토글 오류:", error);
        return res.status(500).json({ success: false, message: "찜하기 처리 중 오류 발생" });
    }
};

/**
 * 판매 상태 변경 (AJAX)
 */
exports.updateStatus = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
        }

        const productId = req.params.id;
        const newStatus = req.body['product-status'] || req.body.status;// 클라이언트에서 status로 보냄

        // 판매자 본인 확인 (보안)
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "상품을 찾을 수 없습니다." });
        }

        if (product.seller_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "권한이 없습니다." });
        }

        // 상태 업데이트
        await Product.update(productId, { status: newStatus });

        return res.json({
            success: true,
            status: newStatus
        });

    } catch (error) {
        console.error("상태 변경 오류:", error);
        return res.status(500).json({ success: false, message: "상태 변경 중 오류 발생" });
    }
};