CREATE TABLE restaurants
(
    restaurant_id INT AUTO_INCREMENT PRIMARY KEY,

    restaurant_name VARCHAR(255) NOT NULL,

    email VARCHAR(255),

    phone VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);