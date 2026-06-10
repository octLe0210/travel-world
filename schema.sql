-- ============================================================
-- 旅游网站数据库设计 (MySQL)
-- 核心实体：用户、目的地、景点、酒店、旅行套餐、订单
-- ============================================================

CREATE DATABASE IF NOT EXISTS travel_db DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_db;

-- ----------------------------
-- 1. 用户表
-- ----------------------------
CREATE TABLE users (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(100)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL COMMENT 'bcrypt hash',
  nickname    VARCHAR(50)   NOT NULL,
  phone       VARCHAR(20)   DEFAULT NULL,
  avatar      VARCHAR(255)  DEFAULT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone)
) ENGINE=InnoDB COMMENT='用户表';

-- ----------------------------
-- 2. 目的地（国家/地区/城市）
-- ----------------------------
CREATE TABLE destinations (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL COMMENT '目的地名称',
  parent_id    BIGINT UNSIGNED DEFAULT NULL COMMENT '父级目的地（如巴黎属于法国）',
  level        TINYINT      NOT NULL DEFAULT 1 COMMENT '层级: 1=洲, 2=国家, 3=城市',
  cover_img    VARCHAR(255) DEFAULT NULL,
  description  TEXT         DEFAULT NULL,
  star_rating  DECIMAL(2,1) DEFAULT NULL COMMENT '评分 1.0-5.0',
  sort_order   INT          DEFAULT 0,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES destinations(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_level (level)
) ENGINE=InnoDB COMMENT='目的地表';

-- ----------------------------
-- 3. 景点
-- ----------------------------
CREATE TABLE attractions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id BIGINT UNSIGNED NOT NULL,
  name          VARCHAR(150) NOT NULL,
  cover_img     VARCHAR(255) DEFAULT NULL,
  description   TEXT         DEFAULT NULL,
  ticket_price  DECIMAL(10,2) DEFAULT NULL COMMENT '门票参考价',
  opening_hours VARCHAR(100) DEFAULT NULL,
  duration_hint VARCHAR(50)  DEFAULT NULL COMMENT '建议游玩时长',
  lat           DECIMAL(10,7) DEFAULT NULL,
  lng           DECIMAL(10,7) DEFAULT NULL,
  sort_order    INT          DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  INDEX idx_dest (destination_id)
) ENGINE=InnoDB COMMENT='景点表';

-- ----------------------------
-- 4. 酒店
-- ----------------------------
CREATE TABLE hotels (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id BIGINT UNSIGNED NOT NULL,
  name           VARCHAR(150) NOT NULL,
  star_level     TINYINT      DEFAULT 3 COMMENT '星级 1-5',
  address        VARCHAR(255) DEFAULT NULL,
  cover_img      VARCHAR(255) DEFAULT NULL,
  description    TEXT         DEFAULT NULL,
  price_per_night DECIMAL(10,2) DEFAULT NULL COMMENT '参考价/晚',
  lat            DECIMAL(10,7) DEFAULT NULL,
  lng            DECIMAL(10,7) DEFAULT NULL,
  sort_order     INT          DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  INDEX idx_dest (destination_id),
  INDEX idx_star (star_level)
) ENGINE=InnoDB COMMENT='酒店表';

-- ----------------------------
-- 5. 旅行套餐
-- ----------------------------
CREATE TABLE packages (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  destination_id BIGINT UNSIGNED NOT NULL,
  title          VARCHAR(200) NOT NULL,
  cover_img      VARCHAR(255) DEFAULT NULL,
  description    TEXT         DEFAULT NULL,
  days           INT          NOT NULL COMMENT '行程天数',
  price          DECIMAL(10,2) NOT NULL COMMENT '成人价格',
  child_price    DECIMAL(10,2) DEFAULT NULL,
  max_people     INT          DEFAULT 20,
  itinerary      JSON         DEFAULT NULL COMMENT '每日行程安排 JSON',
  is_hot         TINYINT(1)   DEFAULT 0,
  is_published   TINYINT(1)   DEFAULT 1,
  sort_order     INT          DEFAULT 0,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  INDEX idx_dest (destination_id),
  INDEX idx_price (price),
  INDEX idx_hot (is_hot)
) ENGINE=InnoDB COMMENT='旅行套餐表';

-- ----------------------------
-- 6. 套餐-景点关联（多对多）
-- ----------------------------
CREATE TABLE package_attractions (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  package_id    BIGINT UNSIGNED NOT NULL,
  attraction_id BIGINT UNSIGNED NOT NULL,
  day_number    INT DEFAULT NULL COMMENT '第几天参观',
  sort_order    INT DEFAULT 0,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_pkg_attr (package_id, attraction_id),
  INDEX idx_pkg (package_id),
  INDEX idx_attr (attraction_id)
) ENGINE=InnoDB COMMENT='套餐-景点关联表';

-- ----------------------------
-- 7. 套餐-酒店关联（多对多）
-- ----------------------------
CREATE TABLE package_hotels (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  package_id  BIGINT UNSIGNED NOT NULL,
  hotel_id    BIGINT UNSIGNED NOT NULL,
  nights      INT DEFAULT 1 COMMENT '入住几晚',
  room_type   VARCHAR(50) DEFAULT NULL COMMENT '房型',
  sort_order  INT DEFAULT 0,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
  UNIQUE KEY uk_pkg_hotel (package_id, hotel_id),
  INDEX idx_pkg (package_id),
  INDEX idx_hotel (hotel_id)
) ENGINE=InnoDB COMMENT='套餐-酒店关联表';

-- ----------------------------
-- 8. 订单表
-- ----------------------------
CREATE TABLE orders (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no        VARCHAR(32)  NOT NULL UNIQUE COMMENT '订单号',
  user_id         BIGINT UNSIGNED NOT NULL,
  package_id      BIGINT UNSIGNED NOT NULL,
  contact_name    VARCHAR(50)  NOT NULL COMMENT '联系人',
  contact_phone   VARCHAR(20)  NOT NULL,
  contact_email   VARCHAR(100) DEFAULT NULL,
  adult_count     INT          NOT NULL DEFAULT 1 COMMENT '成人数',
  child_count     INT          DEFAULT 0 COMMENT '儿童数',
  total_price     DECIMAL(10,2) NOT NULL,
  departure_date  DATE         NOT NULL,
  status          ENUM('pending','paid','confirmed','cancelled','completed') DEFAULT 'pending',
  remark          TEXT         DEFAULT NULL COMMENT '用户备注',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (package_id) REFERENCES packages(id),
  INDEX idx_user (user_id),
  INDEX idx_pkg (package_id),
  INDEX idx_status (status),
  INDEX idx_order_no (order_no)
) ENGINE=InnoDB COMMENT='订单表';

-- ----------------------------
-- 关键关联关系说明：
--
-- destinations (1) ──< (N) attractions   目的地下有多个景点
-- destinations (1) ──< (N) hotels         目的地下有多个酒店
-- destinations (1) ──< (N) packages       目的地对应多个旅行套餐
--
-- packages (M) >──< (N) attractions      套餐可包含多个景点 (package_attractions)
-- packages (M) >──< (N) hotels            套餐可包含多个酒店 (package_hotels)
--
-- users (1) ──< (N) orders                一个用户可有多个订单
-- packages (1) ──< (N) orders             一个套餐可被多次预订
-- ============================================================
