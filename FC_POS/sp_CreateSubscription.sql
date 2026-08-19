DELIMITER $$

CREATE PROCEDURE sp_CreateSubscription
(
    IN p_restaurant_id INT,
    IN p_plan_id INT,
    IN p_amount DECIMAL(10,2)
)
BEGIN

    INSERT INTO subscriptions
    (
        restaurant_id,
        plan_id,
        amount,
        trial_end_date,
        next_billing_date
    )
    VALUES
    (
        p_restaurant_id,
        p_plan_id,
        p_amount,
        DATE_ADD(NOW(), INTERVAL 14 DAY),
        DATE_ADD(NOW(), INTERVAL 14 DAY)
    );

END$$

DELIMITER ;