//쿼리를 날리는 것은 여기서 처리한다.
/*
Controller (컨트롤러)
    ↓ 호출
Model (models/User.js, models/Product.js)
    ↓ 사용
DB Pool (config/db.js)
    ↓ 연결
MySQL Database
*/
const db = require('../config/db');

const Product = {
    /**
     * 상품 목록 조회 (검색/필터링 지원)
     * 파라미터로 {Object} filters - 필터 옵션 { category?, keyword?, status?, limit?, offset? }
     * 반환값으로 {Promise<Array>} 상품 배열 (이미지 포함)
     */
async findAll(filters = {}, userId = null) {
        const { category, keyword, status, limit = 20, offset = 0 } = filters;

        let query = `
            SELECT 
                p.id,
                p.seller_id,
                p.title,
                p.price,
                p.category,
                p.description,
                p.location,
                p.status,
                p.created_at,
                u.nickname as seller_nickname,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) as like_count,
                (SELECT image_path FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail,
                ${userId ? '(SELECT COUNT(*) FROM likes WHERE product_id = p.id AND user_id = ?) as is_liked' : '0 as is_liked'}
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE 1=1
        `;      
        const params = [];
        // userId가 존재할 경우, SELECT 부분의 첫 번째 ? 를 채움
        if (userId) {
            params.push(userId);
        }
        // 동적 WHERE 절 생성 (SQL Injection 방지)
        if (category) {
            query += ' AND p.category = ?';
            params.push(category);
        }
        if (keyword) {
            // Full-Text 인덱스 사용 (MATCH ... AGAINST)
            // IN BOOLEAN MODE: AND, OR, +, - 등 연산자 사용 가능
            // 예: '맥북 -중고' (맥북은 포함, 중고는 제외)
            query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (status) {
            query += ' AND p.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const [rows] = await db.query(query, params);
        return rows;
    },

    /**
     * ID로 상품 상세 조회
     * 파라미터로는 {number} id - 조회할 상품 ID
     * 반환값은 {Promise<Object|null>} 상품 객체 (이미지 배열 포함) 또는 null
     */
    async findById(id) {
        // 상품 기본 정보 조회
        const [productRows] = await db.query(
            `SELECT 
                p.*,
                u.nickname as seller_nickname,
                u.campus as seller_campus,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) as like_count
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE p.id = ?`,
            [id]
        );
        
        if (!productRows[0]) return null;
        
        // 상품 이미지 조회
        const [imageRows] = await db.query(
            'SELECT id, image_path FROM product_images WHERE product_id = ? ORDER BY id',
            [id]
        );
        
        return {
            ...productRows[0],
            images: imageRows
        };
    },

    /**
     * 새 상품 생성
     * 파라미터로 {Object} productData - 상품 데이터 { seller_id, title, price, category, description, location? }
     * 파라미터로 {Array<string>} imagePaths - 이미지 경로 배열
     * 반환값은 {Promise<Object>} 생성된 상품 객체
     */
    async create(productData, imagePaths = []) {
        const { seller_id, title, price, category, description, location = null } = productData;
        
        // 트랜잭션 시작
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // 상품 생성
            const [result] = await connection.query(
                'INSERT INTO products (seller_id, title, price, category, description, location) VALUES (?, ?, ?, ?, ?, ?)',
                [seller_id, title, price, category, description, location]
            );
            
            const productId = result.insertId;
            
            // 이미지 등록
            if (imagePaths.length > 0) {
                const imageValues = imagePaths.map(path => [productId, path]);
                await connection.query(
                    'INSERT INTO product_images (product_id, image_path) VALUES ?',
                    [imageValues]
                );
            }
            
            await connection.commit();
            connection.release();
            
            return await this.findById(productId);
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    },

    /**
     * 상품 정보 수정
     * 파라미터로 {number} id - 수정할 상품 ID
     * 파라미터로 {Object} updateData - 수정할 데이터
     * 반환값은 {Promise<Object>} 수정된 상품 객체
     */
    async update(id, updateData) {
        const fields = [];
        const values = [];
        
        if (updateData.title !== undefined) {
            fields.push('title = ?');
            values.push(updateData.title);
        }
        if (updateData.price !== undefined) {
            fields.push('price = ?');
            values.push(updateData.price);
        }
        if (updateData.category !== undefined) {
            fields.push('category = ?');
            values.push(updateData.category);
        }
        if (updateData.description !== undefined) {
            fields.push('description = ?');
            values.push(updateData.description);
        }
        if (updateData.location !== undefined) {
            fields.push('location = ?');
            values.push(updateData.location);
        }
        if (updateData.status !== undefined) {
            fields.push('status = ?');
            values.push(updateData.status);
        }
        
        if (fields.length === 0) {
            return await this.findById(id);
        }
        
        values.push(id);
        await db.query(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        return await this.findById(id);
    },

    /**
     * 상품 삭제
     * 파라미터로 {number} id - 삭제할 상품 ID
     * 반환값으로 {Promise<boolean>} 삭제 성공 여부
     */
    async delete(id) {
        const [result] = await db.query(
            'DELETE FROM products WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * 판매자 ID로 상품 목록 조회
     * 파라미터로 {number} sellerId - 판매자 ID
     * 반환값으로 {Promise<Array>} 상품 배열
     */
    async findBySellerId(sellerId) {
        const [rows] = await db.query(
            `SELECT 
                p.*,
                (SELECT COUNT(*) FROM likes WHERE product_id = p.id) as like_count,
                (SELECT image_path FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail
            FROM products p
            WHERE p.seller_id = ?
            ORDER BY p.created_at DESC`,
            [sellerId]
        );
        return rows;
    },

    /**
     * 찜하기 추가/제거 (토글)
     * 파라미터로 {number} userId - 사용자 ID
     * 파라미터로 {number}   - 상품 ID
     * 반환값으로 {Promise<boolean>} 찜하기 상태 (true: 추가됨, false: 제거됨)
     */
    async toggleLike(userId, productId) {
        // 기존 찜하기 확인
        const [existing] = await db.query(
            'SELECT * FROM likes WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        
        if (existing.length > 0) {
            // 찜하기 제거
            await db.query(
                'DELETE FROM likes WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );
            return false;
        } else {
            // 찜하기 추가
            await db.query(
                'INSERT INTO likes (user_id, product_id) VALUES (?, ?)',
                [userId, productId]
            );
            return true;
        }
    },

        async countLikes(productId) {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS count FROM likes WHERE product_id = ?',
            [productId]
        );
        return rows[0].count;
    },

    

    /**
     * 사용자가 찜한 상품 목록 조회
     * 파라미터로 {number} userId - 사용자 ID
     * 반환값으로 {Promise<Array>} 찜한 상품 배열
     */
    async findLikedByUser(userId) {
        const [rows] = await db.query(
            `SELECT 
                p.*,
                u.nickname as seller_nickname,
                (SELECT image_path FROM product_images WHERE product_id = p.id LIMIT 1) as thumbnail
            FROM likes l
            INNER JOIN products p ON l.product_id = p.id
            LEFT JOIN users u ON p.seller_id = u.id
            WHERE l.user_id = ?
            ORDER BY l.created_at DESC`,
            [userId]
        );
        return rows;
    }
};

module.exports = Product;