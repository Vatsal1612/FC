CREATE TABLE plan_features
(
    feature_id INT AUTO_INCREMENT PRIMARY KEY,

    plan_id INT NOT NULL,

    feature_name VARCHAR(255) NOT NULL,

    feature_value DECIMAL(10,2) DEFAULT 0,

    FOREIGN KEY (plan_id)
    REFERENCES subscription_plans(plan_id)
);

INSERT INTO plan_features
(
    plan_id,
    feature_name,
    feature_value
)
VALUES

(2, 'Online Ordering', 300),

(2, 'POS Premium', 300),

(2, 'Happy Hour', 250),

(2, 'Bio Link', 49),

(2, 'WhatsApp Automation', 300),

(2, 'Kitchen Display System', 150),

(2, 'Additional Menu', 100),

(2, 'SnapDish', 100),

(2, 'Team Training', 350);