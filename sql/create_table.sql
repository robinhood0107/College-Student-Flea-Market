--(각자 root mysql 비번 사용하세요)(그냥 그게 편할 것 같음)
--mysql 8.0.44 기준

mysql -u root -p
CREATE DATABASE IF NOT EXISTS market_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE market_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 고유 ID',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '로그인 이메일 (중복 불가)',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호',
    nickname VARCHAR(50) NOT NULL COMMENT '사용자 닉네임',
    campus VARCHAR(50) DEFAULT NULL COMMENT '캠퍼스 (옵션)',
    profile_img VARCHAR(255) DEFAULT NULL COMMENT '프로필 이미지 경로',
    isAdmin BOOLEAN DEFAULT FALSE COMMENT '관리자 여부 (0:일반, 1:관리자)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 정보';

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '상품 고유 ID',
    seller_id INT NOT NULL COMMENT '판매자 ID (FK)',
    title VARCHAR(200) NOT NULL COMMENT '상품 제목',
    price INT NOT NULL COMMENT '가격',
    category VARCHAR(50) NOT NULL COMMENT '카테고리 (전자기기, 도서 등)',
    description TEXT COMMENT '상품 상세 설명',
    location VARCHAR(100) COMMENT '거래 희망 장소',
    status ENUM('FOR_SALE', 'RESERVED', 'SOLD_OUT') DEFAULT 'FOR_SALE' COMMENT '판매 상태',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
    
    CONSTRAINT fk_products_seller FOREIGN KEY (seller_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='상품 매물 정보';

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_title ON products(title);

-- Full-Text 인덱스: title과 description에서 키워드 검색 성능 향상시키기 위해서 사용할 것!
CREATE FULLTEXT INDEX idx_products_fulltext ON products(title, description);


CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL COMMENT '상품 ID (FK)',
    image_path VARCHAR(255) NOT NULL COMMENT '이미지 파일 경로 (/uploads/...)',
    
    CONSTRAINT fk_images_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='상품 이미지 목록';

CREATE TABLE likes (
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, product_id),
    
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_product FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='관심 상품(찜)';

CREATE TABLE sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
) ENGINE=InnoDB;