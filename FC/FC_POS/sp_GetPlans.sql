DELIMITER $$

CREATE PROCEDURE sp_GetPlans()
BEGIN

    SELECT *
    FROM subscription_plans
    WHERE is_active = TRUE;

END$$

DELIMITER ;