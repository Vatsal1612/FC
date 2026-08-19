CREATE TABLE cart_items
(
    item_id INT AUTO_INCREMENT PRIMARY KEY,

    cart_id INT NOT NULL,

    addon_id INT,

    option_id INT,

    quantity INT DEFAULT 1,

    price DECIMAL(10,2) DEFAULT 0,

    FOREIGN KEY (cart_id)
    REFERENCES carts(cart_id),

    FOREIGN KEY (addon_id)
    REFERENCES add_ons(addon_id),

    FOREIGN KEY (option_id)
    REFERENCES addon_options(option_id)
);