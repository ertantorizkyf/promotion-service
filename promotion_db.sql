-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               9.1.0 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS promotion_db;

USE promotion_db;

-- Dumping structure for table promotion_db.cities
CREATE TABLE IF NOT EXISTS `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table promotion_db.cities: ~10 rows (approximately)
INSERT IGNORE INTO `cities` (`id`, `name`) VALUES
  (1, 'Kota Jakarta'),
  (2, 'Kota Surabaya'),
  (3, 'Kota Bandung'),
  (4, 'Kota Medan'),
  (5, 'Kota Semarang'),
  (6, 'Kota Makassar'),
  (7, 'Kota Palembang'),
  (8, 'Kota Batam'),
  (9, 'Kota Pekanbaru'),
  (10, 'Kota Bogor');

-- Dumping structure for table promotion_db.menus
CREATE TABLE IF NOT EXISTS `menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table promotion_db.menus: ~8 rows (approximately)
INSERT IGNORE INTO `menus` (`id`, `name`, `description`, `price`) VALUES
  (1, 'Nasi Goreng', 'Nasi goreng biasa dengan toping telur dan sayur', 39000.00),
  (2, 'Mie Goreng', 'Mie goreng biasa dengan toping telur dan sayur', 40000.00),
  (3, 'Rice Bowl Chicken', 'Nasi dengan ayam popcorn dengan telur ceplok dan salad', 32000.00),
  (4, 'Rice Bowl Slice Beef', 'Nasi dengan slice beef teriyaki dengan telur ceplok dan salad', 38000.00),
  (5, 'Americano', 'Espresso dengan tambahan air', 20000.00),
  (6, 'Milk Tea', 'Teh dengan tambahan susu dan toping boba', 29000.00),
  (7, 'Matcha Latte', 'Teh hijau/matcha dengan tambahan susu', 29000.00),
  (8, 'Mineral Water', 'Air mineral kemasan 600 ml', 8000.00);

-- Dumping structure for table promotion_db.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_amount` decimal(15,2) NOT NULL,
  `promotion_id` int DEFAULT NULL,
  `promotion_amount` decimal(15,2) DEFAULT '0.00',
  `total_amount` decimal(15,2) NOT NULL,
  `status` enum('draft','pending_payment','processing','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `promotion_id` (`promotion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table promotion_db.orders: ~1 rows (approximately)
INSERT IGNORE INTO `orders` (`id`, `user_id`, `order_amount`, `promotion_id`, `promotion_amount`, `total_amount`, `status`,
`created_at`, `updated_at`, `deleted_at`) VALUES
  (1, 2, 154000.00, NULL, 0.00, 154000.00, 'pending_payment', '2025-01-20 07:51:31', '2025-01-20 08:10:23', NULL);

-- Dumping structure for table promotion_db.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `total_amount` decimal(15,2) NOT NULL,
  PRIMARY KEY (`order_id`,`menu_id`),
  KEY `menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table promotion_db.order_items: ~0 rows (approximately)
INSERT IGNORE INTO `order_items` (`order_id`, `menu_id`, `quantity`, `total_amount`) VALUES
  (1, 1, 2, 78000.00),
  (1, 2, 1, 40000.00),
  (1, 5, 1, 20000.00),
  (1, 8, 2, 16000.00);

-- Dumping structure for table promotion_db.promotions
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text,
  `type` enum('percentage','fixed_cut') NOT NULL DEFAULT 'fixed_cut',
  `target_user` enum('all','new','loyal','specific_city') NOT NULL DEFAULT 'all',
  `discount_amount` decimal(15,2) NOT NULL,
  `max_discount_amount` decimal(15,2) DEFAULT NULL,
  `min_order_amount` decimal(15,2) DEFAULT '0.00',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `max_redemptions` int DEFAULT NULL,
  `max_redemptions_per_user` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table promotion_db.promotions: ~4 rows (approximately)
INSERT IGNORE INTO `promotions` (`id`, `name`, `code`, `description`, `type`, `target_user`, `discount_amount`, `max_discount_amount`, `min_order_amount`,
`start_date`, `end_date`, `max_redemptions`, `max_redemptions_per_user`) VALUES
  (1, 'Diskon Awal Tahun', 'DAT20250101', 'Diskon awal tahun untuk semua pengguna', 'fixed_cut', 'all', 10000.00, 10000.00, 50000.00, '2024-12-23', '2025-01-12', 999999, 2),
  (2, 'New Member Only', 'NMO00000000', 'Diskon hanya untuk pengguna baru', 'percentage', 'new', 40.00, 40000.00, 80000.00, '1900-01-01', '9999-12-31', 999999, 1),
  (3, 'Loyal Customer Discount', 'LCD20250101', 'Diskon khusus untuk pengguna setia', 'percentage', 'loyal', 45.00, 80000.00, 100000.00, '2025-01-01', '2025-06-30', 100, 5),
  (4, 'Diskon di kota Kamu', 'SCD20250101', 'Diskon khusus hanya di kota kamu', 'fixed_cut', 'specific_city', 5000.00, 5000.00, 50000.00, '2025-01-01', '2025-02-28', 50, 2);

-- Dumping structure for table promotion_db.promotion_cities
CREATE TABLE IF NOT EXISTS `promotion_cities` (
  `promotion_id` int NOT NULL,
  `city_id` int NOT NULL,
  UNIQUE KEY `promotion_id` (`promotion_id`,`city_id`),
  KEY `city_id` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table promotion_db.promotion_cities: ~0 rows (approximately)
INSERT IGNORE INTO `promotion_cities` (`promotion_id`, `city_id`) VALUES
  (4, 1), (4, 3), (4, 10);

-- Dumping structure for table promotion_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `address` text,
  `city_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `city_id` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table promotion_db.users: ~2 rows (approximately)
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `address`, `city_id`) VALUES
  (1, 'Admin', 'admin@mail.com', '$2b$10$5paM9veZ1OBMIcXZ2JUHGOOijlW6c1mVcT9zTWbNir7HaaAprpgdi', 'admin', 'Some long address detail', 1),
  (2, 'Customer', 'customer@mail.com', '$2b$10$.h0jiO47eWkA/ank8F/VPucijsfY8xGGZBPMwVSwpl1usIsA55Pc6', 'customer', 'Some long address detail', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
