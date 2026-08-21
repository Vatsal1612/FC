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
DROP TABLE IF EXISTS page_settings;
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

-- 2. page_settings (For dynamic page titles, subtitles, badges, headers)
CREATE TABLE page_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    page_name VARCHAR(50) NOT NULL DEFAULT 'Subscription',
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. subscription_plans
CREATE TABLE subscription_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- 'POS', 'Growth', 'Ordering'
    tier_name VARCHAR(50) NOT NULL DEFAULT '', -- 'Lite', 'Premium', 'Growth', 'Fix', 'Commission'
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'Monthly', -- 'Monthly', 'Yearly', 'Both', 'OneTime'
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    monthly_price DECIMAL(10,2) DEFAULT 0,
    yearly_price DECIMAL(10,2) DEFAULT 0,
    one_time_price DECIMAL(10,2) DEFAULT 0,
    original_price DECIMAL(10,2) DEFAULT 0, -- Struck-through price (e.g. 1899.00)
    trial_days INT DEFAULT 14,
    badge_text VARCHAR(100) DEFAULT NULL, -- e.g. 'Most Recommended', 'Save 52%'
    tagline VARCHAR(255) DEFAULT NULL, -- e.g. 'All Features in One Plan'
    description TEXT,
    cta_text VARCHAR(100) DEFAULT 'Start 14 Day Free Trial',
    learn_more_url VARCHAR(255) DEFAULT '#',
    display_order INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. plan_features
CREATE TABLE plan_features (
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NULL,
    plan_type VARCHAR(50) NOT NULL, -- 'POS', 'Growth', 'Ordering'
    tier_name VARCHAR(50) NOT NULL, -- 'Lite', 'Premium', 'Growth', 'Fix', 'Commission'
    category_name VARCHAR(100) NULL, -- 'Billing & operations', 'Setup & customization', 'Everything in Lite, plus', 'Online & QR ordering'
    feature_name VARCHAR(255) NOT NULL,
    feature_value DECIMAL(10,2) DEFAULT 0, -- Value for growth bundled items (e.g. 300.00)
    display_order INT DEFAULT 1,
    is_highlighted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE SET NULL
);

-- 5. add_ons
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

-- 6. addon_images
CREATE TABLE addon_images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    addon_id INT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 1,
    FOREIGN KEY (addon_id) REFERENCES add_ons(addon_id) ON DELETE CASCADE
);

-- 7. addon_options
CREATE TABLE addon_options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    addon_id INT NOT NULL,
    option_name VARCHAR(100) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'Monthly',
    price DECIMAL(10,2) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (addon_id) REFERENCES add_ons(addon_id) ON DELETE CASCADE
);

-- 8. carts
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    plan_id INT NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'Monthly',
    total_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id)
);

-- 9. cart_items
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

-- 10. subscriptions
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

-- 11. payments
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

-- ==========================================================
-- SEED DATA
-- ==========================================================

-- Page UI Settings
INSERT INTO page_settings (page_name, setting_key, setting_value) VALUES
('Subscription', 'header_title', 'Upgrade Your Restaurant Growth'),
('Subscription', 'header_subtitle', 'Everything you need to run, manage, and grow your restaurant in one place.'),
('Subscription', 'cycle_toggle_monthly_label', 'Monthly'),
('Subscription', 'cycle_toggle_yearly_label', 'Yearly'),
('Subscription', 'cycle_discount_badge', 'Save 40%'),
('Subscription', 'growth_guarantee_text', '250 Orders Guaranteed in 90 Days'),
('Subscription', 'growth_yearly_note', 'Growth Plan Available on Yearly Plan'),
('Subscription', 'growth_all_features_note', 'All Features in One Plan'),
('Subscription', 'cta_free_trial', 'Start 14 Day Free Trial'),
('Subscription', 'btn_learn_more', 'Learn More');

-- Demo Restaurant
INSERT INTO restaurants (name, email, phone, address) VALUES
('Demo Bistro', 'demo@bistro.com', '+1234567890', '123 Gourmet St');

-- Subscription Plans (Covering POS Lite, POS Premium, Growth, Ordering Fix, Ordering Commission)
INSERT INTO subscription_plans (plan_id, plan_name, plan_type, tier_name, billing_cycle, price, monthly_price, yearly_price, one_time_price, original_price, trial_days, badge_text, tagline, description, cta_text, learn_more_url, display_order) VALUES
(1, 'POS (Point of Sale) Plan - Lite', 'POS', 'Lite', 'Both', 10.00, 10.00, 10.00, 0.00, 0.00, 14, NULL, NULL, 'Everything a single-outlet restaurant needs to start billing today.', 'Start 14 Day Free Trial', '#', 1),
(2, 'POS (Point of Sale) Plan - Premium', 'POS', 'Premium', 'Both', 30.00, 30.00, 25.00, 0.00, 0.00, 14, 'Most Recommended', NULL, 'Everything a single-outlet restaurant needs to start billing today.', 'Start 14 Day Free Trial', '#', 2),
(3, 'Growth Plan', 'Growth', 'Growth', 'Yearly', 600.00, 0.00, 600.00, 0.00, 1899.00, 14, 'Save 52%', 'All Features in One Plan', 'Complete restaurant growth suite with all features and add-ons bundled.', 'Start 14 Day Free Trial', '#', 3),
(4, 'Online Ordering Plan - Fix', 'Ordering', 'Fix', 'Both', 30.00, 30.00, 25.00, 0.00, 0.00, 14, NULL, NULL, 'Predictable cost, unlimited orders', 'Start 14 Day Free Trial', '#', 4),
(5, 'Online Ordering Plan - Commission', 'Ordering', 'Commission', 'OneTime', 99.00, 0.00, 0.00, 99.00, 0.00, 14, NULL, '1.8% Order Commission | $1 Platform Fee', 'Lifetime plan • One-time payment', 'Start 14 Day Free Trial', '#', 5);

-- Plan Features

-- 1. POS Lite Plan Features
INSERT INTO plan_features (plan_id, plan_type, tier_name, category_name, feature_name, feature_value, display_order) VALUES
(1, 'POS', 'Lite', 'Billing & operations', 'Includes everything in Free plan', 0.00, 1),
(1, 'POS', 'Lite', 'Billing & operations', 'payment methods (cash, UPI, card)', 0.00, 2),
(1, 'POS', 'Lite', 'Billing & operations', 'Address customization for delivery', 0.00, 3),
(1, 'POS', 'Lite', 'Billing & operations', 'Service charges & tax setup', 0.00, 4),
(1, 'POS', 'Lite', 'Billing & operations', 'Multi-user with role permissions', 0.00, 5),
(1, 'POS', 'Lite', 'Billing & operations', 'Item notes & item codes', 0.00, 6),
(1, 'POS', 'Lite', 'Billing & operations', 'Expense tracking & daily reports', 0.00, 7),
(1, 'POS', 'Lite', 'Setup & customization', 'Printer customization (KOT & receipt)', 0.00, 8),
(1, 'POS', 'Lite', 'Setup & customization', 'Table reservation', 0.00, 9),
(1, 'POS', 'Lite', 'Setup & customization', 'Cloud sync across devices', 0.00, 10),
(1, 'POS', 'Lite', 'Setup & customization', 'Font & theme settings', 0.00, 11),
(1, 'POS', 'Lite', 'Setup & customization', 'Email & WhatsApp support', 0.00, 12),
(1, 'POS', 'Lite', 'Setup & customization', 'Support', 0.00, 13);

-- 2. POS Premium Plan Features
INSERT INTO plan_features (plan_id, plan_type, tier_name, category_name, feature_name, feature_value, display_order) VALUES
(2, 'POS', 'Premium', 'Everything in Lite, plus', 'Meal deals & combo builder', 0.00, 1),
(2, 'POS', 'Premium', 'Everything in Lite, plus', 'Split bill & split payment', 0.00, 2),
(2, 'POS', 'Premium', 'Everything in Lite, plus', 'Multiple menus (lunch, dinner, party)', 0.00, 3),
(2, 'POS', 'Premium', 'Everything in Lite, plus', 'Item-level cost & profit estimates', 0.00, 4),
(2, 'POS', 'Premium', 'Everything in Lite, plus', 'Multi-user with role permissions', 0.00, 5),
(2, 'POS', 'Premium', 'Everything in Lite, plus', 'Item notes & item codes', 0.00, 6),
(2, 'POS', 'Premium', 'Everything in Lite, plus', 'Expense tracking & daily reports', 0.00, 7),
(2, 'POS', 'Premium', 'Online & QR ordering', 'Auto-print online orders to KOT', 0.00, 8),
(2, 'POS', 'Premium', 'Online & QR ordering', 'Online order auto-accept rules', 0.00, 9),
(2, 'POS', 'Premium', 'Online & QR ordering', 'Coupons & promo codes', 0.00, 10),
(2, 'POS', 'Premium', 'Online & QR ordering', 'Dine-in QR code (table-side ordering)', 0.00, 11);

-- 3. Growth Plan Features (Bundled value items)
INSERT INTO plan_features (plan_id, plan_type, tier_name, category_name, feature_name, feature_value, display_order) VALUES
(3, 'Growth', 'Growth', 'Included Bundles', 'Online Ordering Plan', 300.00, 1),
(3, 'Growth', 'Growth', 'Included Bundles', 'POS Premium Plan', 300.00, 2),
(3, 'Growth', 'Growth', 'Included Bundles', 'Happy Hour', 250.00, 3),
(3, 'Growth', 'Growth', 'Included Bundles', 'Bio Link Page', 49.00, 4),
(3, 'Growth', 'Growth', 'Included Bundles', 'WhatsApp Automation', 300.00, 5),
(3, 'Growth', 'Growth', 'Included Bundles', 'KDS — Kitchen Display', 150.00, 6),
(3, 'Growth', 'Growth', 'Included Bundles', 'Additional Menu', 100.00, 7),
(3, 'Growth', 'Growth', 'Included Bundles', 'Snap Dish', 100.00, 8),
(3, 'Growth', 'Growth', 'Included Bundles', 'Setup and Team Training', 350.00, 9);

-- 4. Online Ordering Fix Plan Features
INSERT INTO plan_features (plan_id, plan_type, tier_name, category_name, feature_name, feature_value, display_order) VALUES
(4, 'Ordering', 'Fix', NULL, 'Takeaway / Dine-in / Delivery Ordering', 0.00, 1),
(4, 'Ordering', 'Fix', NULL, 'Razorpay payment gateway', 0.00, 2),
(4, 'Ordering', 'Fix', NULL, 'Online Order Management', 0.00, 3),
(4, 'Ordering', 'Fix', NULL, '$2000 Free Sales Credit', 0.00, 4),
(4, 'Ordering', 'Fix', NULL, 'Menu customization', 0.00, 5),
(4, 'Ordering', 'Fix', NULL, 'Tax Management', 0.00, 6),
(4, 'Ordering', 'Fix', NULL, 'Promo Code / Coupon', 0.00, 7),
(4, 'Ordering', 'Fix', NULL, 'Multiple Language', 0.00, 8),
(4, 'Ordering', 'Fix', NULL, 'Delivery Integration', 0.00, 9),
(4, 'Ordering', 'Fix', NULL, 'Custom Domain', 0.00, 10),
(4, 'Ordering', 'Fix', NULL, 'Google Analytics', 0.00, 11),
(4, 'Ordering', 'Fix', NULL, 'Coaching Session', 0.00, 12),
(4, 'Ordering', 'Fix', NULL, 'SEO Optimization', 0.00, 13);

-- 5. Online Ordering Commission Plan Features
INSERT INTO plan_features (plan_id, plan_type, tier_name, category_name, feature_name, feature_value, display_order) VALUES
(5, 'Ordering', 'Commission', NULL, 'Take Away / Dine In / Delivery', 0.00, 1),
(5, 'Ordering', 'Commission', NULL, 'Razorpay payment gateway', 0.00, 2),
(5, 'Ordering', 'Commission', NULL, '1.8 % Order Commission On Every Order', 0.00, 3),
(5, 'Ordering', 'Commission', NULL, '$1 Platform Fee to Customer', 0.00, 4),
(5, 'Ordering', 'Commission', NULL, 'Online Order Management', 0.00, 5),
(5, 'Ordering', 'Commission', NULL, '$4000 Free Sales Credit', 0.00, 6),
(5, 'Ordering', 'Commission', NULL, 'Menu customization', 0.00, 7),
(5, 'Ordering', 'Commission', NULL, 'Tax Management', 0.00, 8),
(5, 'Ordering', 'Commission', NULL, 'Promo Code / Coupon', 0.00, 9),
(5, 'Ordering', 'Commission', NULL, 'Multiple Language', 0.00, 10),
(5, 'Ordering', 'Commission', NULL, 'Own Driver/Porter Delivery Integration', 0.00, 11),
(5, 'Ordering', 'Commission', NULL, 'Custom Domain', 0.00, 12),
(5, 'Ordering', 'Commission', NULL, 'SEO Optimization', 0.00, 13);

-- Addons Seed Data
INSERT INTO add_ons (addon_id, addon_name, description, monthly_price, yearly_price, one_time_price, quantity_enabled, growth_included) VALUES
(1, 'Online Ordering', 'Direct customer web ordering module', 30.00, 300.00, 99.00, FALSE, TRUE),
(2, 'QR Digital Menu', 'Contactless digital menu system with QR scanning', 29.00, 79.00, 0.00, FALSE, TRUE),
(3, 'Kitchen Display System', 'Real-time kitchen order ticket routing and management system', 20.00, 150.00, 0.00, TRUE, TRUE),
(4, 'Table Reservation', 'Interactive seating chart and reservation management system', 9.00, 99.00, 0.00, FALSE, TRUE),
(5, 'Happy Hour', 'Dynamic time-based pricing and automated promotion scheduler', 20.83, 250.00, 0.00, FALSE, TRUE),
(6, 'Bio Link', 'Social media landing page for menu links and orders', 4.08, 49.00, 0.00, FALSE, TRUE),
(7, 'Additional Menu', 'Multi-menu support for lunch, dinner, catering, and seasonal menus', 8.33, 100.00, 0.00, FALSE, TRUE),
(8, 'SnapDish', 'AI-assisted food photography enhancer and menu visualizer', 8.33, 100.00, 0.00, FALSE, TRUE);

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

-- ==========================================================
-- STORED PROCEDURES
-- ==========================================================

-- Page Settings Procedures
DROP PROCEDURE IF EXISTS sp_GetPageSettings;
DELIMITER $$
CREATE PROCEDURE sp_GetPageSettings(IN p_page_name VARCHAR(50))
BEGIN
    IF p_page_name IS NULL OR p_page_name = '' THEN
        SELECT setting_id, page_name, setting_key, setting_value FROM page_settings;
    ELSE
        SELECT setting_id, page_name, setting_key, setting_value FROM page_settings WHERE page_name = p_page_name;
    END IF;
END$$
DELIMITER ;

-- Plans Procedures
DROP PROCEDURE IF EXISTS sp_GetPlans;
DELIMITER $$
CREATE PROCEDURE sp_GetPlans()
BEGIN
    SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY display_order ASC;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetPlanDetails;
DELIMITER $$
CREATE PROCEDURE sp_GetPlanDetails(IN p_plan_id INT)
BEGIN
    SELECT * FROM subscription_plans WHERE plan_id = p_plan_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetPlanFeatures;
DELIMITER $$
CREATE PROCEDURE sp_GetPlanFeatures(
    IN p_plan_type VARCHAR(50),
    IN p_tier_name VARCHAR(50)
)
BEGIN
    SELECT pf.*
    FROM plan_features pf
    WHERE (p_plan_type IS NULL OR p_plan_type = '' OR pf.plan_type = p_plan_type)
      AND (p_tier_name IS NULL OR p_tier_name = '' OR pf.tier_name = p_tier_name)
    ORDER BY pf.display_order ASC;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_GetGrowthPlanFeatures;
DELIMITER $$
CREATE PROCEDURE sp_GetGrowthPlanFeatures()
BEGIN
    SELECT pf.feature_id, pf.plan_id, pf.plan_type, pf.tier_name, pf.category_name, pf.feature_name, pf.feature_value, pf.display_order
    FROM plan_features pf
    WHERE pf.plan_type = 'Growth'
    ORDER BY pf.display_order ASC;
END$$
DELIMITER ;

-- Add-ons Procedures
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
