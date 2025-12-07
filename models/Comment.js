const db = require('../config/db');

const Comment = {
    /**
     * 특정 상품의 댓글 + 대댓글 전체 조회
     * (대댓글은 parent_id 로 구분함)
     */
    async findByProductId(productId) {
        const [rows] = await db.query(
            `SELECT 
                c.id,
                c.product_id,
                c.user_id,
                c.content,
                c.parent_id,
                c.created_at,
                u.nickname AS user_nickname,
                u.profile_img AS user_profile_img
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.product_id = ?
            ORDER BY c.parent_id ASC, c.created_at ASC`,
            [productId]
        );

        return rows;
    },

    /**
     * 댓글 생성 (일반 댓글)
     */
    async createComment(productId, userId, content) {
        const [result] = await db.query(
            `INSERT INTO comments (product_id, user_id, content, parent_id)
             VALUES (?, ?, ?, NULL)`,
            [productId, userId, content]
        );

        return result.insertId;
    },

    /**
     * 답글 생성 (parent_id 지정)
     */
    async createReply(productId, userId, content, parentId) {
        const [result] = await db.query(
            `INSERT INTO comments (product_id, user_id, content, parent_id)
             VALUES (?, ?, ?, ?)`,
            [productId, userId, content, parentId]
        );

        return result.insertId;
    },

    /**
     * 댓글/답글 삭제
     * (CASCADE 로 대댓글 자동 삭제됨)
     */
    async delete(commentId) {
        const [result] = await db.query(
            `DELETE FROM comments WHERE id = ?`,
            [commentId]
        );

        return result.affectedRows > 0;
    }
};

module.exports = Comment;
