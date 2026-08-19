DELIMITER $$

CREATE PROCEDURE sp_GetAddOnOptions
(
    IN p_addon_id INT,
    IN p_billing_cycle VARCHAR(20)
)
BEGIN

    SELECT *
    FROM addon_options
    WHERE addon_id = p_addon_id
    AND billing_cycle = p_billing_cycle;

END$$

DELIMITER ;