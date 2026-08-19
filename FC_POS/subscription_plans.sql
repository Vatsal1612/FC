CREATE TABLE subscription_plans
(
    plan_id INT AUTO_INCREMENT PRIMARY KEY,

    plan_name VARCHAR(100) NOT NULL,

    plan_type ENUM
    (
        'POS',
        'Growth',
        'Ordering'
    ) NOT NULL,

    billing_cycle ENUM
    (
        'Monthly',
        'Yearly'
    ) NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    trial_days INT DEFAULT 14,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



INSERT INTO subscription_plans
(
    plan_name,
    plan_type,
    billing_cycle,
    price
)
VALUES

(
    'POS Lite Plan',
    'POS',
    'Monthly',
    10
),

(
    'Growth Plan',
    'Growth',
    'Yearly',
    600
),

(
    'Online Ordering',
    'Ordering',
    'Monthly',
    30
);