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
/**
 * models/User.js - 사용자(User) 관련 데이터베이스 쿼리
 * 
 * 역할:
 * - users 테이블에 대한 모든 SQL 쿼리를 담당
 * - 컨트롤러에서 호출할 수 있는 재사용 가능한 함수들 제공
 * - config/db.js의 pool을 사용하여 실제 쿼리 실행
 * 
 * config/db.js와의 차별화:
 * - config/db.js: 데이터베이스 연결 풀 설정 (어떻게 연결할지)
 * - models/User.js: 실제 SQL 쿼리 실행 (무엇을 조회/수정할지)
 * 
 * 사용 예시:
 * const User = require('./models/User');
 * const user = await User.findByEmail('test@example.com');
 * const newUser = await User.create({ email: '...', password: '...', nickname: '...' });
 */

const db = require('../config/db'); // config/db.js의 pool 객체 사용

//예시))))
const User = {
    async findByEmail(email) {
        // 실제 SQL 쿼리 실행
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0] || null;
    }
};