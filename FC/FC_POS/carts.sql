CREATE TABLE carts
(
    cart_id INT AUTO_INCREMENT PRIMARY KEY,

    restaurant_id INT NOT NULL,

    plan_id INT NOT NULL,

    billing_cycle ENUM
    (
        'Monthly',
        'Yearly'
    ) NOT NULL,

    total_amount DECIMAL(10,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(restaurant_id),

    FOREIGN KEY (plan_id)
    REFERENCES subscription_plans(plan_id)
);