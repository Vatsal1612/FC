DELIMITER $$

CREATE PROCEDURE sp_GetYearlyAddOns()
BEGIN

    SELECT
        a.*,
        ai.image_path
    FROM add_ons a
    LEFT JOIN addon_images ai
        ON a.addon_id = ai.addon_id
    WHERE a.is_active = TRUE;

END$$

DELIMITER ;