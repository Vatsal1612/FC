DELIMITER $$

CREATE PROCEDURE sp_GetCart
(
    IN p_cart_id INT
)
BEGIN

    SELECT *
    FROM carts
    WHERE cart_id = p_cart_id;

END$$

DELIMITER ;