DELIMITER $$

CREATE PROCEDURE sp_RemoveCartItem
(
    IN p_item_id INT
)
BEGIN

    DELETE
    FROM cart_items
    WHERE item_id = p_item_id;

END$$

DELIMITER ;