CREATE TABLE add_ons
(
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


INSERT INTO add_ons
(
    addon_name,
    description,
    monthly_price,
    yearly_price,
    one_time_price,
    quantity_enabled,
    growth_included
)
VALUES

(
    'Online Ordering',
    'Restaurant online ordering',
    30,
    300,
    99,
    FALSE,
    TRUE
),

(
    'QR Digital Menu',
    'Digital menu system',
    29,
    79,
    0,
    FALSE,
    TRUE
),

(
    'Kitchen Display System',
    'Kitchen operations',
    20,
    150,
    0,
    TRUE,
    TRUE
),

(
    'Table Reservation',
    'Reservation management',
    9,
    99,
    0,
    FALSE,
    TRUE
),

(
    'Happy Hour',
    'Discount scheduling',
    20.83,
    250,
    0,
    FALSE,
    TRUE
),

(
    'Bio Link',
    'Restaurant bio page',
    4.08,
    49,
    0,
    FALSE,
    TRUE
),

(
    'Additional Menu',
    'Multiple menu support',
    8.33,
    100,
    0,
    FALSE,
    TRUE
),

(
    'SnapDish',
    'Food photography',
    8.33,
    100,
    0,
    FALSE,
    TRUE
);