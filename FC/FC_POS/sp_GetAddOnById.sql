DELIMITER $$

CREATE PROCEDURE sp_GetAddOnById
(
    IN p_addon_id INT
)
BEGIN

    SELECT *
    FROM add_ons
    WHERE addon_id = p_addon_id;

END$$

DELIMITER ;