CREATE TABLE addon_images
(
    image_id INT AUTO_INCREMENT PRIMARY KEY,

    addon_id INT NOT NULL,

    image_path VARCHAR(500) NOT NULL,

    is_primary BOOLEAN DEFAULT TRUE,

    display_order INT DEFAULT 1,

    FOREIGN KEY (addon_id)
    REFERENCES add_ons(addon_id)
);