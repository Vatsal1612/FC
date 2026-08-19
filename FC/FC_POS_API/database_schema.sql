-- Database creation
CREATE DATABASE IF NOT EXISTS restaurant_subscription;
USE restaurant_subscription;

-- Drop tables if exist in reverse order of foreign key dependency
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS addon_options;
DROP TABLE IF EXISTS addon_images;
DROP TABLE IF EXISTS add_ons;
DROP TABLE IF EXISTS plan_features;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS restaurants;

-- 1. restaurants
CREATE TABLE restaurants (
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. subscription_plans
CREATE TABLE subscription_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_type ENUM('POS', 'Growth', 'Ordering') NOT NULL,
    billing_cycle ENUM('Monthly', 'Yearly') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    trial_days INT DEFAULT 14,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. plan_features
CREATE TABLE plan_features (
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    feature_value DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE CASCADE
);

-- 4. add_ons
CREATE TABLE add_ons (
    addon_id INT AUTO_INCREMENT PRIMARY KEY,
    addon_name VARCHAR(100) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) DEFAULT 0,
    yearly_price DECIMAL(10,2) DEFAULT 0,
    one_time_price DECIMAL(10,2) DEFAULT 0,
    quantity_enabled BOOLEAN DEFAULT FALSE,
    growth_included BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. addon_images
CREATE TABLE addon_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    addon_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    FOREIGN KEY (addon_id) REFERENCES add_ons(addon_id) ON DELETE CASCADE
);

-- 6. addon_options
CREATE TABLE addon_options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    addon_id INT NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    billing_cycle ENUM('Monthly', 'Yearly') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (addon_id) REFERENCES add_ons(addon_id) ON DELETE CASCADE
);

-- 7. carts
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    plan_id INT NOT NULL,
    billing_cycle ENUM('Monthly', 'Yearly') NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id)
);

-- 8. cart_items
CREATE TABLE cart_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    addon_id INT,
    option_id INT,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (addon_id) REFERENCES add_ons(addon_id),
    FOREIGN KEY (option_id) REFERENCES addon_options(option_id)
);

-- 9. subscriptions
CREATE TABLE subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    trial_end_date DATETIME,
    next_billing_date DATETIME,
    status ENUM('Trial', 'Active', 'Expired', 'Cancelled') DEFAULT 'Trial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id)
);

-- 10. payments
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    subscription_id INT NOT NULL,
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Pending', 'Success', 'Failed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id)
);

-- Seed Data
INSERT INTO restaurants (name, email, phone, address) VALUES
('Demo Bistro', 'demo@bistro.com', '+1234567890', '123 Gourmet St');

INSERT INTO subscription_plans (plan_name, plan_type, billing_cycle, price, trial_days, description) VALUES
('POS Lite Plan', 'POS', 'Monthly', 10.00, 14, 'Essential POS solution for small to medium restaurants'),
('Growth Plan', 'Growth', 'Yearly', 600.00, 14, 'All-in-one growth suite with complete features included'),
('Online Ordering', 'Ordering', 'Monthly', 30.00, 14, 'Standalone Online Ordering plan for direct sales');

INSERT INTO plan_features (plan_id, feature_name, feature_value) VALUES
(2, 'Online Ordering', 300.00),
(2, 'POS Premium', 300.00),
(2, 'Happy Hour', 250.00),
(2, 'Bio Link', 49.00),
(2, 'WhatsApp Automation', 300.00),
(2, 'Kitchen Display System', 150.00),
(2, 'Additional Menu', 100.00),
(2, 'SnapDish', 100.00),
(2, 'Team Training', 350.00);

INSERT INTO add_ons (addon_name, description, monthly_price, yearly_price, one_time_price, quantity_enabled, growth_included) VALUES
('Online Ordering', 'Direct customer web ordering module', 30.00, 300.00, 99.00, FALSE, TRUE),
('QR Digital Menu', 'Contactless digital menu system with QR scanning', 29.00, 79.00, 0.00, FALSE, TRUE),
('Kitchen Display System', 'Real-time kitchen order ticket routing and management system', 20.00, 150.00, 0.00, TRUE, TRUE),
('Table Reservation', 'Interactive seating chart and reservation management system', 9.00, 99.00, 0.00, FALSE, TRUE),
('Happy Hour', 'Dynamic time-based pricing and automated promotion scheduler', 20.83, 250.00, 0.00, FALSE, TRUE),
('Bio Link', 'Social media landing page for menu links and orders', 4.08, 49.00, 0.00, FALSE, TRUE),
('Additional Menu', 'Multi-menu support for lunch, dinner, catering, and seasonal menus', 8.33, 100.00, 0.00, FALSE, TRUE),
('SnapDish', 'AI-assisted food photography enhancer and menu visualizer', 8.33, 100.00, 0.00, FALSE, TRUE);

INSERT INTO addon_images (addon_id, image_path, is_primary, display_order) VALUES
(1, '/Content/images/addons/online_ordering.jpg', TRUE, 1),
(2, '/Content/images/addons/qr_menu.jpg', TRUE, 1),
(3, '/Content/images/addons/kds.jpg', TRUE, 1),
(4, '/Content/images/addons/table_reservation.jpg', TRUE, 1),
(5, '/Content/images/addons/happy_hour.jpg', TRUE, 1),
(6, '/Content/images/addons/bio_link.jpg', TRUE, 1),
(7, '/Content/images/addons/additional_menu.jpg', TRUE, 1),
(8, '/Content/images/addons/snapdish.jpg', TRUE, 1);

INSERT INTO addon_options (addon_id, option_name, billing_cycle, price, is_default) VALUES
(1, 'Fixed Plan', 'Monthly', 30.00, TRUE),
(1, 'Commission Plan', 'Monthly', 99.00, FALSE),
(1, 'Fixed Plan', 'Yearly', 300.00, TRUE),
(1, 'Commission Plan', 'Yearly', 99.00, FALSE);

-- STORED PROCEDURES

-- Plans
DROP PROCEDURE IF EXISTS sp_GetPlans;
DELIMITER $$
CREATE PROCEDURE sp_GetPlans()
BEGIN
    SELECT * FROM subscription_plans WHERE is_active = TRUE;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetPlanDetails;
DELIMITER $$
CREATE PROCEDURE sp_GetPlanDetails(IN p_plan_id INT)
BEGIN
    SELECT * FROM subscription_plans WHERE plan_id = p_plan_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetGrowthPlanFeatures;
DELIMITER $$
CREATE PROCEDURE sp_GetGrowthPlanFeatures()
BEGIN
    SELECT pf.feature_id, pf.plan_id, pf.feature_name, pf.feature_value
    FROM plan_features pf
    INNER JOIN subscription_plans sp ON pf.plan_id = sp.plan_id
    WHERE sp.plan_type = 'Growth';
END$$
DELIMITER ;

-- Add-ons
DROP PROCEDURE IF EXISTS sp_GetMonthlyAddOns;
DELIMITER $$
CREATE PROCEDURE sp_GetMonthlyAddOns()
BEGIN
    SELECT a.*, ai.image_path
    FROM add_ons a
    LEFT JOIN addon_images ai ON a.addon_id = ai.addon_id AND ai.is_primary = TRUE
    WHERE a.is_active = TRUE;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetYearlyAddOns;
DELIMITER $$
CREATE PROCEDURE sp_GetYearlyAddOns()
BEGIN
    SELECT a.*, ai.image_path
    FROM add_ons a
    LEFT JOIN addon_images ai ON a.addon_id = ai.addon_id AND ai.is_primary = TRUE
    WHERE a.is_active = TRUE;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetAddOnById;
DELIMITER $$
CREATE PROCEDURE sp_GetAddOnById(IN p_addon_id INT)
BEGIN
    SELECT a.*, ai.image_path
    FROM add_ons a
    LEFT JOIN addon_images ai ON a.addon_id = ai.addon_id AND ai.is_primary = TRUE
    WHERE a.addon_id = p_addon_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetAddOnOptions;
DELIMITER $$
CREATE PROCEDURE sp_GetAddOnOptions(IN p_addon_id INT, IN p_billing_cycle VARCHAR(20))
BEGIN
    SELECT * FROM addon_options
    WHERE addon_id = p_addon_id
    AND (p_billing_cycle IS NULL OR p_billing_cycle = '' OR billing_cycle = p_billing_cycle);
END$$
DELIMITER ;

-- Cart Procedures
DROP PROCEDURE IF EXISTS sp_CreateCart;
DELIMITER $$
CREATE PROCEDURE sp_CreateCart(
    IN p_restaurant_id INT,
    IN p_plan_id INT,
    IN p_billing_cycle VARCHAR(20)
)
BEGIN
    INSERT INTO carts (restaurant_id, plan_id, billing_cycle, total_amount)
    VALUES (p_restaurant_id, p_plan_id, p_billing_cycle, 0);

    SELECT LAST_INSERT_ID() AS cart_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetCart;
DELIMITER $$
CREATE PROCEDURE sp_GetCart(IN p_cart_id INT)
BEGIN
    SELECT c.*, sp.plan_name, sp.price AS plan_price
    FROM carts c
    INNER JOIN subscription_plans sp ON c.plan_id = sp.plan_id
    WHERE c.cart_id = p_cart_id;

    SELECT ci.*, a.addon_name, a.quantity_enabled, ao.option_name
    FROM cart_items ci
    LEFT JOIN add_ons a ON ci.addon_id = a.addon_id
    LEFT JOIN addon_options ao ON ci.option_id = ao.option_id
    WHERE ci.cart_id = p_cart_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_AddCartItem;
DELIMITER $$
CREATE PROCEDURE sp_AddCartItem(
    IN p_cart_id INT,
    IN p_addon_id INT,
    IN p_option_id INT,
    IN p_quantity INT,
    IN p_price DECIMAL(10,2)
)
BEGIN
    INSERT INTO cart_items (cart_id, addon_id, option_id, quantity, price)
    VALUES (p_cart_id, p_addon_id, p_option_id, p_quantity, p_price);

    SELECT LAST_INSERT_ID() AS item_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateCartItem;
DELIMITER $$
CREATE PROCEDURE sp_UpdateCartItem(
    IN p_item_id INT,
    IN p_quantity INT
)
BEGIN
    UPDATE cart_items
    SET quantity = p_quantity
    WHERE item_id = p_item_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_RemoveCartItem;
DELIMITER $$
CREATE PROCEDURE sp_RemoveCartItem(IN p_item_id INT)
BEGIN
    DELETE FROM cart_items WHERE item_id = p_item_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_CalculateCartTotal;
DELIMITER $$
CREATE PROCEDURE sp_CalculateCartTotal(IN p_cart_id INT)
BEGIN
    DECLARE v_plan_price DECIMAL(10,2) DEFAULT 0;

    SELECT sp.price INTO v_plan_price
    FROM carts c
    INNER JOIN subscription_plans sp ON c.plan_id = sp.plan_id
    WHERE c.cart_id = p_cart_id;

    UPDATE carts
    SET total_amount = (v_plan_price + IFNULL((SELECT SUM(price * quantity) FROM cart_items WHERE cart_id = p_cart_id), 0))
    WHERE cart_id = p_cart_id;

    SELECT total_amount FROM carts WHERE cart_id = p_cart_id;
END$$
DELIMITER ;

-- Subscription Procedures
DROP PROCEDURE IF EXISTS sp_CreateSubscription;
DELIMITER $$
CREATE PROCEDURE sp_CreateSubscription(
    IN p_restaurant_id INT,
    IN p_plan_id INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN
    INSERT INTO subscriptions (restaurant_id, plan_id, amount, trial_end_date, next_billing_date, status)
    VALUES (p_restaurant_id, p_plan_id, p_amount, DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'Trial');

    SELECT LAST_INSERT_ID() AS subscription_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetSubscription;
DELIMITER $$
CREATE PROCEDURE sp_GetSubscription(IN p_subscription_id INT)
BEGIN
    SELECT s.*, r.name AS restaurant_name, r.email AS restaurant_email, sp.plan_name
    FROM subscriptions s
    INNER JOIN restaurants r ON s.restaurant_id = r.restaurant_id
    INNER JOIN subscription_plans sp ON s.plan_id = sp.plan_id
    WHERE s.subscription_id = p_subscription_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdateSubscriptionStatus;
DELIMITER $$
CREATE PROCEDURE sp_UpdateSubscriptionStatus(
    IN p_subscription_id INT,
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE subscriptions
    SET status = p_status
    WHERE subscription_id = p_subscription_id;
END$$
DELIMITER ;

-- Payment Procedures
DROP PROCEDURE IF EXISTS sp_CreatePayment;
DELIMITER $$
CREATE PROCEDURE sp_CreatePayment(
    IN p_subscription_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_order_id VARCHAR(100)
)
BEGIN
    INSERT INTO payments (subscription_id, amount, razorpay_order_id, payment_status)
    VALUES (p_subscription_id, p_amount, p_order_id, 'Pending');

    SELECT LAST_INSERT_ID() AS payment_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_UpdatePaymentStatus;
DELIMITER $$
CREATE PROCEDURE sp_UpdatePaymentStatus(
    IN p_payment_id INT,
    IN p_payment_id_razorpay VARCHAR(100),
    IN p_status VARCHAR(20)
)
BEGIN
    UPDATE payments
    SET razorpay_payment_id = p_payment_id_razorpay,
        payment_status = p_status
    WHERE payment_id = p_payment_id;
END$$
DELIMITER ;
