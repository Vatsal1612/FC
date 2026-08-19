DELIMITER $$

CREATE PROCEDURE sp_UpdatePaymentStatus
(
    IN p_payment_id INT,
    IN p_payment_status VARCHAR(20),
    IN p_razorpay_payment_id VARCHAR(100)
)
BEGIN

    UPDATE payments
    SET payment_status = p_payment_status,
        razorpay_payment_id = p_razorpay_payment_id
    WHERE payment_id = p_payment_id;

END$$

DELIMITER ;