-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: market_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '댓글 고유 ID',
  `product_id` int NOT NULL COMMENT '상품 ID (FK)',
  `user_id` int NOT NULL COMMENT '댓글 작성자 ID (FK)',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '댓글 내용',
  `parent_id` int DEFAULT NULL COMMENT '부모 댓글 ID (NULL이면 일반 댓글)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '작성일',
  PRIMARY KEY (`id`),
  KEY `fk_comments_product` (`product_id`),
  KEY `fk_comments_user` (`user_id`),
  KEY `fk_comments_parent` (`parent_id`),
  CONSTRAINT `fk_comments_parent` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`product_id`),
  KEY `fk_likes_product` (`product_id`),
  CONSTRAINT `fk_likes_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='관심 상품(찜)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (2,3,'2025-11-11 11:00:00'),(2,5,'2025-12-06 19:40:02'),(2,6,'2025-11-19 16:00:00'),(3,1,'2025-11-02 10:30:00'),(3,5,'2025-11-17 13:20:00'),(3,7,'2025-11-21 09:30:00'),(4,1,'2025-11-11 14:20:00'),(4,3,'2025-11-11 11:30:00'),(4,8,'2025-11-23 14:11:00'),(5,1,'2025-11-04 09:11:00'),(5,10,'2025-11-29 10:00:00');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL COMMENT '상품 ID (FK)',
  `image_path` varchar(255) NOT NULL COMMENT '이미지 파일 경로 (/uploads/...)',
  PRIMARY KEY (`id`),
  KEY `fk_images_product` (`product_id`),
  CONSTRAINT `fk_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='상품 이미지 목록';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://picsum.photos/800/600?random=1'),(2,1,'https://picsum.photos/800/600?random=2'),(3,1,'https://picsum.photos/800/600?random=3'),(4,2,'https://picsum.photos/800/600?random=4'),(5,3,'https://picsum.photos/800/600?random=5'),(6,4,'https://picsum.photos/800/600?random=6'),(7,4,'https://picsum.photos/800/600?random=7'),(8,5,'https://picsum.photos/800/600?random=8'),(9,5,'https://picsum.photos/800/600?random=9'),(10,6,'https://picsum.photos/800/600?random=10'),(11,7,'https://picsum.photos/800/600?random=11'),(12,8,'https://picsum.photos/800/600?random=11'),(13,9,'https://picsum.photos/800/600?random=13'),(14,10,'https://picsum.photos/800/600?random=14');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '상품 고유 ID',
  `seller_id` int NOT NULL COMMENT '판매자 ID (FK)',
  `title` varchar(200) NOT NULL COMMENT '상품 제목',
  `price` int NOT NULL COMMENT '가격',
  `category` varchar(50) NOT NULL COMMENT '카테고리 (전자기기, 도서 등)',
  `description` text COMMENT '상품 상세 설명',
  `location` varchar(100) DEFAULT NULL COMMENT '거래 희망 장소',
  `status` enum('FOR_SALE','RESERVED','SOLD_OUT') DEFAULT 'FOR_SALE' COMMENT '판매 상태',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '등록일',
  PRIMARY KEY (`id`),
  KEY `fk_products_seller` (`seller_id`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_title` (`title`),
  FULLTEXT KEY `idx_products_fulltext` (`title`,`description`),
  CONSTRAINT `fk_products_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='상품 매물 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,2,'MacBook Pro 14인치 M1 (상태 좋음)',1100000,'디지털기기','2021년에 구매한 맥북 프로 14인치 M1 기본형 모델입니다. 주로 문서 작업과 웹서핑 용도로 사용하여 상태가 매우 깨끗합니다.\n\n외관에 눈에 띄는 스크래치나 찍힘 전혀 없으며, 키보드나 트랙패드도 번들거림 없이 쾌적합니다. 배터리 성능도 95%로 아주 좋습니다.\n\n풀박스 구성으로, 충전기 및 케이블 모두 포함입니다. 직거래는 부산대학교 근처에서 가능합니다.','부산대학교 정문','FOR_SALE','2025-11-11 10:00:00'),(2,2,'Advanced Economics Textbook',25000,'도서','경제학 입문 교재입니다. 깨끗하게 사용했고 필기 없습니다.','부산대학교 도서관 앞','FOR_SALE','2025-11-05 14:30:00'),(3,3,'Used IKEA Desk Lamp',11000,'생활가전','IKEA 데스크 램프입니다. 1년 정도 사용했고 상태 좋습니다.','부산대학교 근처','FOR_SALE','2025-11-10 09:11:00'),(4,3,'프리미엄 울 코트',250000,'의류','겨울 코트입니다. 한 번만 입었고 상태 새것과 같습니다.','부산대학교 정문','RESERVED','2025-11-11 16:20:00'),(5,4,'클래식 레더 부츠',180000,'의류','레더 부츠입니다. 2시즌 사용했지만 관리 잘해서 상태 좋습니다.','부산대학교 근처','FOR_SALE','2025-11-11 11:45:00'),(6,4,'캐시미어 스카프',85000,'의류','고급 캐시미어 스카프입니다. 선물로 받았는데 사용 안 했습니다.','부산대학교 정문','FOR_SALE','2025-11-18 13:30:00'),(7,5,'가구/책상',80000,'가구/인테리어','책상입니다. 이사 가면서 판매합니다. 상태 좋습니다.','부산대학교 근처','FOR_SALE','2025-11-20 11:00:00'),(8,5,'의자',50000,'가구/인테리어','의자입니다. 편안하고 상태 좋습니다.','부산대학교 근처','FOR_SALE','2025-11-22 10:30:00'),(9,6,'노트북 가방',30000,'의류','노트북 가방입니다. 깨끗하게 사용했습니다.','부산대학교 근처','SOLD_OUT','2025-11-25 14:00:00'),(10,6,'무선 마우스',20000,'디지털기기','로지텍 무선 마우스입니다. 거의 새것입니다.','부산대학교 정문','FOR_SALE','2025-11-28 09:00:00');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('InqsPEgAHlVvdrtJWnq4kGF7duW0rPfi',1765146240,'{\"cookie\":{\"originalMaxAge\":7200000,\"expires\":\"2025-12-07T22:21:57.589Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"strict\"},\"passport\":{\"user\":3}}'),('aCWv8KGHgAh8xwVyoI6xfw2JELB9PzMB',1765267380,'{\"cookie\":{\"originalMaxAge\":7200000,\"expires\":\"2025-12-09T08:03:00.276Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"strict\"},\"passport\":{\"user\":2}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '회원 고유 ID',
  `email` varchar(100) NOT NULL COMMENT '로그인 이메일 (중복 불가)',
  `password` varchar(255) NOT NULL COMMENT '비밀번호',
  `nickname` varchar(50) NOT NULL COMMENT '사용자 닉네임',
  `campus` varchar(50) DEFAULT NULL COMMENT '캠퍼스 (옵션)',
  `profile_img` varchar(255) DEFAULT NULL COMMENT '프로필 이미지 경로',
  `isAdmin` tinyint(1) DEFAULT '0' COMMENT '관리자 여부 (0:일반, 1:관리자)',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='회원 정보';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'admin@campus.com','$2a$10$ALt3tN4k5UYFNjNvDey1p.Ti23beCR9GIcDdEXpSO3WvlYaLeZj6K','관리자','부산대학교',NULL,1,'2025-11-11 10:00:00'),(3,'student1@campus.com','$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO','부하예프','부산대학교','https://i.pravatar.cc/150?img=1',0,'2025-11-11 14:30:00'),(4,'student2@campus.com','$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO','정컴휴지도둑','부산대학교','https://i.pravatar.cc/150?img=2',0,'2025-11-11 14:30:00'),(5,'student3@campus.com','$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO','도로롱','부산대학교','https://i.pravatar.cc/150?img=3',0,'2025-11-11 14:30:00'),(6,'student4@campus.com','$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO','김치워리어','부산대학교','https://i.pravatar.cc/150?img=4',0,'2025-11-11 14:30:00'),(7,'student5@campus.com','$2a$10$tIRtyvzSnhQlOlWjnHa2TOihvRU.tZZcaSprekOt.deSAMHF/1upO','호날두','부산대학교','https://i.pravatar.cc/150?img=5',0,'2025-11-11 14:30:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'market_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-09 15:06:02
