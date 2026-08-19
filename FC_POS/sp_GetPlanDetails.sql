DELIMITER $$

CREATE PROCEDURE sp_GetPlanDetails
(
    IN p_plan_id INT
)
BEGIN

    SELECT *
    FROM subscription_plans
    WHERE plan_id = p_plan_id;

END$$

DELIMITER ;