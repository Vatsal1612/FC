CREATE TABLE addon_options
(
    option_id INT AUTO_INCREMENT PRIMARY KEY,

    addon_id INT NOT NULL,

    option_name VARCHAR(100) NOT NULL,

    billing_cycle ENUM
    (
        'Monthly',
        'Yearly'
    ) NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    is_default BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (addon_id)
    REFERENCES add_ons(addon_id)
);


INSERT INTO addon_options
(
    addon_id,
    option_name,
    billing_cycle,
    price,
    is_default
)
VALUES

(1, 'Fixed Plan', 'Monthly', 30, TRUE),

(1, 'Commission Plan', 'Monthly', 99, FALSE),

(1, 'Fixed Plan', 'Yearly', 300, TRUE),

(1, 'Commission Plan', 'Yearly', 99, FALSE);