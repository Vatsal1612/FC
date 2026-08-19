DELIMITER $$

CREATE PROCEDURE sp_CreateCart
(
    IN p_restaurant_id INT,
    IN p_plan_id INT,
    IN p_billing_cycle VARCHAR(20)
)
BEGIN

    INSERT INTO carts
    (
        restaurant_id,
        plan_id,
        billing_cycle
    )
    VALUES
    (
        p_restaurant_id,
        p_plan_id,
        p_billing_cycle
    );

    SELECT LAST_INSERT_ID() AS cart_id;

END$$

DELIMITER ;