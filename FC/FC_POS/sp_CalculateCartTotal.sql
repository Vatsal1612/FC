DELIMITER $$

CREATE PROCEDURE sp_CalculateCartTotal
(
    IN p_cart_id INT
)
BEGIN

    DECLARE v_plan_price DECIMAL(10,2);

    SELECT sp.price
    INTO v_plan_price
    FROM carts c
    INNER JOIN subscription_plans sp
        ON c.plan_id = sp.plan_id
    WHERE c.cart_id = p_cart_id;

    UPDATE carts
    SET total_amount =
    (
        v_plan_price
        +
        (
            SELECT IFNULL(
                SUM(price * quantity),
                0
            )
            FROM cart_items
            WHERE cart_id = p_cart_id
        )
    )
    WHERE cart_id = p_cart_id;

    SELECT total_amount
    FROM carts
    WHERE cart_id = p_cart_id;

END$$

DELIMITER ;