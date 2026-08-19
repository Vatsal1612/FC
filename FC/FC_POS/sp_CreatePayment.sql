DELIMITER $$

CREATE PROCEDURE sp_CreatePayment
(
    IN p_subscription_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_order_id VARCHAR(100)
)
BEGIN

    INSERT INTO payments
    (
        subscription_id,
        amount,
        razorpay_order_id
    )
    VALUES
    (
        p_subscription_id,
        p_amount,
        p_order_id
    );

END$$

DELIMITER ;