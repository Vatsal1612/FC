DELIMITER $$

CREATE PROCEDURE sp_GetSubscription
(
    IN p_subscription_id INT
)
BEGIN

    SELECT *
    FROM subscriptions
    WHERE subscription_id = p_subscription_id;

END$$

DELIMITER ;