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
        let { category, keyword, status, page = 1, sort } = req.query;

        // 영어 카테고리 → 한글로 매핑
        if (category && categoryMap[category]) {
            category = categoryMap[category];
        }

        const limit = 20;
        const offset = (page - 1) * limit;

        const products = await Product.findAll(
            {
                category,
                keyword,
                status,
                sort,   // 추가됨!
                limit,
                offset
            },
            req.user ? req.user.id : null
        );

        return res.render('product/list', { 
            products, 
            category, 
            keyword, 
            status, 
            sort,      //  넘겨줘야 EJS에서 활성화 표시 가능
            page, 
            user: req.user || null 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send("상품 목록 오류");
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
        if (!req.user) {
            return res.status(401).redirect('/auth/login');
        }

        const seller_id = req.user.id;
        const { title, price, category, description, location } = req.body;

        // 입력값 검증
        if (!title || !title.trim()) {
            return res.status(400).send("상품명을 입력해주세요.");
        }
        if (!price || isNaN(price) || parseInt(price) < 0) {
            return res.status(400).send("유효한 가격을 입력해주세요.");
        }
        if (!category || !category.trim()) {
            return res.status(400).send("카테고리를 선택해주세요.");
        }
        if (!description || !description.trim()) {
            return res.status(400).send("상품 설명을 입력해주세요.");
        }

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/${req.file.filename}`;
        }

        await Product.create(
            { seller_id, title: title.trim(), price: parseInt(price), category: category.trim(), description: description.trim(), location: location ? location.trim() : null },
            imagePath ? [imagePath] : []
        );

        return res.redirect('/product/list');
    } catch (error) {
        console.error("상품 등록 오류:", error);
        return res.status(500).send("상품 등록 중 오류 발생");
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

        // 입력값 검증
        if (!title || !title.trim()) {
            return res.status(400).send("상품명을 입력해주세요.");
        }
        if (!price || isNaN(price) || parseInt(price) < 0) {
            return res.status(400).send("유효한 가격을 입력해주세요.");
        }
        if (!category || !category.trim()) {
            return res.status(400).send("카테고리를 선택해주세요.");
        }
        if (!description || !description.trim()) {
            return res.status(400).send("상품 설명을 입력해주세요.");
        }

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
            title: title.trim(),
            price: parseInt(price),
            category: category.trim(),
            description: description.trim(),
            location: location ? location.trim() : null
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

        const seller = await User.findById(product.seller_id);

        // 댓글 전체 조회
        let rawComments = await Comment.findByProductId(id);

        // user 정보 매핑
        rawComments = rawComments.map(c => ({
            ...c,
            user: {
                id: c.user_id,
                nickname: c.user_nickname,
                profile_img: c.user_profile_img
            },
            replies: []   // replies 기본 생성!
        }));

        // parent-child 트리 구조 만들기 (재귀적 지원)
        const commentMap = {};
        rawComments.forEach(c => {
            commentMap[c.id] = c;
        });

        const topLevelComments = [];

        // 모든 댓글을 부모의 replies에 추가 (재귀적으로 처리)
        rawComments.forEach(c => {
            if (c.parent_id === null) {
                topLevelComments.push(c);
            } else {
                if (commentMap[c.parent_id]) {
                    commentMap[c.parent_id].replies.push(c);
                }
            }
        });

        return res.render('product/detail', {
            product,
            seller: seller || null,
            user: req.user || null,
            comments: topLevelComments  // ← 트리 구조 넘김
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

        // 상품 존재 확인
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "상품을 찾을 수 없습니다." });
        }

        const liked = await Product.toggleLike(userId, productId);

        // 좋아요 개수 다시 조회
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
        let newStatus = req.body['product-status'] || req.body.status;

        // SOLD → SOLD_OUT 자동 변환
        if (newStatus === 'SOLD') {
            newStatus = 'SOLD_OUT';
        }

        // DB ENUM에 맞춤
        const validStatuses = ['FOR_SALE', 'RESERVED', 'SOLD_OUT'];
        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({ success: false, message: "유효하지 않은 상태 값입니다." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "상품을 찾을 수 없습니다." });
        }

        if (product.seller_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "권한이 없습니다." });
        }

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

const Comment = require('../models/Comment');  // 추가!

/**
 * 댓글 작성
 */
exports.createComment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).redirect('/auth/login');
        }

        const productId = req.params.id;
        const userId = req.user.id;
        const content = req.body.content?.trim();

        if (!content) {
            return res.status(400).send("댓글 내용을 입력하세요.");
        }

        await Comment.createComment(productId, userId, content);

        return res.redirect(303, `/product/${productId}`);
    } catch (error) {
        console.error("댓글 작성 오류:", error);
        return res.status(500).send("댓글 작성 중 오류 발생");
    }
};

/**
 * 대댓글 작성
 */
exports.createReply = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).redirect('/auth/login');
        }

        const productId = req.params.id;
        const parentId = req.params.commentId;
        const userId = req.user.id;
        const content = req.body.content?.trim();

        if (!content) {
            return res.status(400).send("답글 내용을 입력하세요.");
        }

        await Comment.createReply(productId, userId, content, parentId);

        return res.redirect(303, `/product/${productId}`);
    } catch (error) {
        console.error("대댓글 작성 오류:", error);
        return res.status(500).send("대댓글 작성 중 오류 발생");
    }
};

/**
 * 댓글/대댓글 삭제
 */
exports.deleteComment = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false });
        }

        const commentId = req.params.commentId;

        // 댓글 작성자만 삭제 가능
        const deleted = await Comment.delete(commentId, req.user.id);

        if (!deleted) {
            return res.status(403).json({ success: false, message: "권한이 없습니다." });
        }

        return res.json({ success: true });
    } catch (error) {
        console.error("댓글 삭제 오류:", error);
        return res.status(500).json({ success: false });
    }
};


/**
 * 상품 삭제
 */
exports.delete = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
        }

        const productId = req.params.id;

        // 상품 조회
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "상품을 찾을 수 없습니다." });
        }

        // 판매자 본인 여부 확인
        if (product.seller_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "권한이 없습니다." });
        }

        // 삭제 실행
        await Product.delete(productId);

        return res.json({ success: true });

    } catch (error) {
        console.error("상품 삭제 오류:", error);
        return res.status(500).json({ success: false, message: "삭제 중 오류 발생" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "로그인이 필요합니다." });
        }

        const id = req.params.id;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "상품을 찾을 수 없습니다." });
        }

        if (product.seller_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "권한이 없습니다." });
        }

        // 삭제 순서가 매우 중요함
        await db.query('DELETE FROM product_images WHERE product_id = ?', [id]);
        await db.query('DELETE FROM likes WHERE product_id = ?', [id]);
        await db.query('DELETE FROM comments WHERE product_id = ?', [id]);

        const deleted = await Product.delete(id);

        return res.json({ success: true });
    } catch (error) {
        console.error("상품 삭제 오류:", error);
        return res.status(500).json({ success: false, message: "서버 오류" });
    }
};