-- 더미 데이터 삽입 SQL
-- 사용 전에 create_table.sql을 먼저 실행해야 합니다.

USE market_db;

-- 1. users 테이블 더미 데이터
-- 비밀번호는 모두 'password123'로 해싱 (bcrypt, salt rounds: 10을 기준으로 했을때)
INSERT INTO users (email, password, nickname, campus, profile_img, isAdmin, created_at) VALUES
('admin@campus.com', '$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO', '관리자', '부산대학교', NULL, TRUE, '2025-11-11 10:00:00'),
('student1@campus.com', '$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO', '부하예프', '부산대학교', 'https://i.pravatar.cc/150?img=1', FALSE, '2025-11-11 14:30:00'),
('student2@campus.com', '$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO', '정컴휴지도둑', '부산대학교', 'https://i.pravatar.cc/150?img=2', FALSE, '2025-11-11 14:30:00'),
('student3@campus.com', '$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO', '도로롱', '부산대학교', 'https://i.pravatar.cc/150?img=3', FALSE, '2025-11-11 14:30:00'),
('student4@campus.com', '$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO', '김치워리어', '부산대학교', 'https://i.pravatar.cc/150?img=4', FALSE, '2025-11-11 14:30:00'),
('student5@campus.com', '$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO', '호날두', '부산대학교', 'https://i.pravatar.cc/150?img=5', FALSE, '2025-11-11 14:30:00');

-- 2. products 테이블 더미 데이터
INSERT INTO products (seller_id, title, price, category, description, location, status, created_at) VALUES
(2, 'MacBook Pro 14인치 M1 (상태 좋음)', 1100000, '디지털기기', '2021년에 구매한 맥북 프로 14인치 M1 기본형 모델입니다. 주로 문서 작업과 웹서핑 용도로 사용하여 상태가 매우 깨끗합니다.\n\n외관에 눈에 띄는 스크래치나 찍힘 전혀 없으며, 키보드나 트랙패드도 번들거림 없이 쾌적합니다. 배터리 성능도 95%로 아주 좋습니다.\n\n풀박스 구성으로, 충전기 및 케이블 모두 포함입니다. 직거래는 부산대학교 근처에서 가능합니다.', '부산대학교 정문', 'FOR_SALE', '2025-11-11 10:00:00'),
(2, 'Advanced Economics Textbook', 25000, '도서', '경제학 입문 교재입니다. 깨끗하게 사용했고 필기 없습니다.', '부산대학교 도서관 앞', 'FOR_SALE', '2025-11-05 14:30:00'),
(3, 'Used IKEA Desk Lamp', 11000, '생활가전', 'IKEA 데스크 램프입니다. 1년 정도 사용했고 상태 좋습니다.', '부산대학교 근처', 'FOR_SALE', '2025-11-10 09:11:00'),
(3, '프리미엄 울 코트', 250000, '의류', '겨울 코트입니다. 한 번만 입었고 상태 새것과 같습니다.', '부산대학교 정문', 'RESERVED', '2025-11-11 16:20:00'),
(4, '클래식 레더 부츠', 180000, '의류', '레더 부츠입니다. 2시즌 사용했지만 관리 잘해서 상태 좋습니다.', '부산대학교 근처', 'FOR_SALE', '2025-11-11 11:45:00'),
(4, '캐시미어 스카프', 85000, '의류', '고급 캐시미어 스카프입니다. 선물로 받았는데 사용 안 했습니다.', '부산대학교 정문', 'FOR_SALE', '2025-11-18 13:30:00'),
(5, '가구/책상', 80000, '가구/인테리어', '책상입니다. 이사 가면서 판매합니다. 상태 좋습니다.', '부산대학교 근처', 'FOR_SALE', '2025-11-20 11:00:00'),
(5, '의자', 50000, '가구/인테리어', '의자입니다. 편안하고 상태 좋습니다.', '부산대학교 근처', 'FOR_SALE', '2025-11-22 10:30:00'),
(6, '노트북 가방', 30000, '의류', '노트북 가방입니다. 깨끗하게 사용했습니다.', '부산대학교 근처', 'SOLD_OUT', '2025-11-25 14:00:00'),
(6, '무선 마우스', 20000, '디지털기기', '로지텍 무선 마우스입니다. 거의 새것입니다.', '부산대학교 정문', 'FOR_SALE', '2025-11-28 09:00:00');


-- 3. product_images 테이블 더미 데이터 (상품당 이미지 1장 )
INSERT INTO product_images (product_id, image_path) VALUES
(1, '/uploads/MacBook Pro.jpg'),
(2, '/uploads/Economics Textbook.jpg'),
(3, '/uploads/lamp.jpg'),
(4, '/uploads/Wool Coat.jpg'),
(5, '/uploads/Leather Boots.jpg'),
(6, '/uploads/Cashmere Scarf.jpg'),
(7, '/uploads/Wooden Desk.jpg'),
(8, '/uploads/Chair.jpg'),
(9, '/uploads/Laptop Bag.jpg'),
(10, '/uploads/Wireless Mouse.jpg');



-- 4. likes 테이블 더미 데이터 (찜하기)
INSERT INTO likes (user_id, product_id, created_at) VALUES
(3, 1, '2025-11-02 10:30:00'),
(4, 1, '2025-11-11 14:20:00'),
(5, 1, '2025-11-04 09:11:00'),
(2, 3, '2025-11-11 11:00:00'),
(4, 3, '2025-11-11 11:30:00'),
(2, 5, '2025-11-16 10:45:00'),
(3, 5, '2025-11-17 13:20:00'),
(2, 6, '2025-11-19 16:00:00'),
(3, 7, '2025-11-21 09:30:00'),
(4, 8, '2025-11-23 14:11:00'),
(5, 10, '2025-11-29 10:00:00');

