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
const db = require('../config/db'); // config/db.js의 pool 객체 사용

const User = {
    /**
     * 이메일로 사용자 조회
     * 파라미터로 {string} email - 조회할 이메일
     * 반환값으로 {Promise<Object|null>} 사용자 객체 또는 null
     */
    async findByEmail(email) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null; // 첫 번째 결과 또는 null
    },

    /**
     * ID로 사용자 조회
     * 파라미터로 {number} id - 조회할 사용자 ID
     * 반환값으로 {Promise<Object|null>} 사용자 객체 또는 null
     */
    async findById(id) {
        const [rows] = await db.query(
            'SELECT id, email, nickname, campus, profile_img, isAdmin, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    },

    /**
     * 새 사용자 생성 (회원가입)
     * 파라미터로 {Object} userData - 사용자 데이터 { email, password, nickname, campus? }
     * 반환값으로 {Promise<Object>} 생성된 사용자 객체 (비밀번호 제외)
     */
    async create(userData) {
        const { email, password, nickname, campus = null } = userData;
        const [result] = await db.query(
            'INSERT INTO users (email, password, nickname, campus) VALUES (?, ?, ?, ?)',
            [email, password, nickname, campus]
        );
        // 생성된 사용자 정보 반환 (비밀번호 제외)
        return await this.findById(result.insertId);
    },

    /**
     * 사용자 정보 수정
     * 파라미터로 {number} id - 수정할 사용자 ID
     * 파라미터로 {Object} updateData - 수정할 데이터 { nickname?, campus?, profile_img?, password? }
     * 반환값으로 {Promise<Object>} 수정된 사용자 객체
     */
    async update(id, updateData) {
        const fields = [];
        const values = [];
        
        if (updateData.nickname !== undefined) {
            fields.push('nickname = ?');
            values.push(updateData.nickname);
        }
        if (updateData.campus !== undefined) {
            fields.push('campus = ?');
            values.push(updateData.campus);
        }
        if (updateData.profile_img !== undefined) {
            fields.push('profile_img = ?');
            values.push(updateData.profile_img);
        }
        if (updateData.password !== undefined) {
            fields.push('password = ?');
            values.push(updateData.password);
        }
        
        if (fields.length === 0) {
            return await this.findById(id);
        }
        
        values.push(id);
        await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        
        return await this.findById(id);
    },

    /**
     * 사용자 삭제
     * 파라미터로 {number} id - 삭제할 사용자 ID
     * 반환값으로 {Promise<boolean>} 삭제 성공 여부
     */
    async delete(id) {
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * (관리자용)
     * 전체 사용자 목록 조회 
     * 파라미터로 {Object} options - 조회 옵션 { limit?, offset? }
     * 반환값으로 {Promise<Array>} 사용자 배열
     */
    async findAll(options = {}) {
        const { limit = 50, offset = 0 } = options;
        const [rows] = await db.query(
            'SELECT id, email, nickname, campus, isAdmin, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }
};

module.exports = User;