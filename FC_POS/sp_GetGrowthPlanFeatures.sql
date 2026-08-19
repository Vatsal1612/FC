DELIMITER $$

CREATE PROCEDURE sp_GetGrowthPlanFeatures()
BEGIN

    SELECT
        pf.feature_name,
        pf.feature_value
    FROM plan_features pf
    INNER JOIN subscription_plans sp
        ON pf.plan_id = sp.plan_id
    WHERE sp.plan_type = 'Growth';

END$$

DELIMITER ;