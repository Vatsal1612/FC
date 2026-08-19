DELIMITER $$

CREATE PROCEDURE sp_AddCartItem
(
    IN p_cart_id INT,
    IN p_addon_id INT,
    IN p_option_id INT,
    IN p_quantity INT,
    IN p_price DECIMAL(10,2)
)
BEGIN

    INSERT INTO cart_items
    (
        cart_id,
        addon_id,
        option_id,
        quantity,
        price
    )
    VALUES
    (
        p_cart_id,
        p_addon_id,
        p_option_id,
        p_quantity,
        p_price
    );

END$$

DELIMITER ;