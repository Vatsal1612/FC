CREATE TABLE subscriptions
(
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,

    restaurant_id INT NOT NULL,

    plan_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    trial_end_date DATETIME,

    next_billing_date DATETIME,

    status ENUM
    (
        'Trial',
        'Active',
        'Expired',
        'Cancelled'
    ) DEFAULT 'Trial',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(restaurant_id),

    FOREIGN KEY (plan_id)
    REFERENCES subscription_plans(plan_id)
);