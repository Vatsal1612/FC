DELIMITER $$

CREATE PROCEDURE sp_UpdateSubscriptionStatus
(
    IN p_subscription_id INT,
    IN p_status VARCHAR(20)
)
BEGIN

    UPDATE subscriptions
    SET status = p_status
    WHERE subscription_id = p_subscription_id;

END$$

DELIMITER ;