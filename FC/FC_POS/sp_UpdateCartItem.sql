DELIMITER $$

CREATE PROCEDURE sp_UpdateCartItem
(
    IN p_item_id INT,
    IN p_quantity INT
)
BEGIN

    UPDATE cart_items
    SET quantity = p_quantity
    WHERE item_id = p_item_id;

END$$

DELIMITER ;