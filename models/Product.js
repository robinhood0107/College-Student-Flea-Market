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
 * models/Product.js - 상품(Product) 관련 데이터베이스 쿼리
 * 
 * 역할:
 * - products, product_images, likes 테이블에 대한 모든 SQL 쿼리 담당
 * - 컨트롤러에서 호출할 수 있는 재사용 가능한 함수들 제공
 * - config/db.js의 pool을 사용하여 실제 쿼리 실행
 * 
 * config/db.js와의 차별화:
 * - config/db.js: 데이터베이스 연결 풀 설정 (어떻게 연결할지)
 * - models/Product.js: 실제 SQL 쿼리 실행 (무엇을 조회/수정할지)
 * 
 * 사용 예시:
 * const Product = require('./models/Product');
 * const products = await Product.findAll({ category: '전자기기', keyword: '맥북' });
 * const product = await Product.findById(1);
 */

const db = require('../config/db'); // config/db.js의 pool 객체 사용
