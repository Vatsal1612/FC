CREATE TABLE payments
(
    payment_id INT AUTO_INCREMENT PRIMARY KEY,

    subscription_id INT NOT NULL,

    razorpay_order_id VARCHAR(100),

    razorpay_payment_id VARCHAR(100),

    amount DECIMAL(10,2) NOT NULL,

    payment_status ENUM
    (
        'Pending',
        'Success',
        'Failed'
    ) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (subscription_id)
    REFERENCES subscriptions(subscription_id)
);