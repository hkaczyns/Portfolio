-- Zwiększ koszt budynku, jeśli ponad 33% graczy w danej sesji ma już ten budynek
-- w przynajmniej jednym terytorium.

DROP PROCEDURE IF EXISTS AdjustBuildingCosts;

DELIMITER //

CREATE PROCEDURE AdjustBuildingCosts(IN in_session_id INT)
BEGIN
    DECLARE total_players INT;
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_building_id INT;
    DECLARE player_count INT;

    -- Kursor iterujący po budynkach w danej sesji
    DECLARE building_cursor CURSOR FOR
        SELECT DISTINCT building_id
        FROM constructions
        WHERE session_id = in_session_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Ilu graczy jest w tej sesji?
    SELECT COUNT(*) INTO total_players
    FROM players
    WHERE session_id = in_session_id;

    OPEN building_cursor;

    building_loop: LOOP
        FETCH building_cursor INTO current_building_id;
        IF done THEN
            LEAVE building_loop;
        END IF;

        -- Policz graczy posiadających budynek
        SELECT COUNT(DISTINCT t_o.player_id) INTO player_count
        FROM constructions c
                 INNER JOIN territories t
                     ON c.territory_id = t.territory_id
                 INNER JOIN territory_ownership t_o
                     ON c.territory_id = t_o.territory_id
                        AND c.session_id = t_o.session_id
        WHERE c.session_id = in_session_id
          AND c.building_id = current_building_id;

        -- Jeśli ponad 33% graczy ma ten budynek, zwiększ koszt
        IF player_count > (total_players / 3) THEN
            UPDATE building_cost
            SET cost = CEIL(cost * 1.1)
            WHERE building_id = current_building_id;
        END IF;
    END LOOP;

    CLOSE building_cursor;
END //

DELIMITER ;

SELECT * FROM building_cost;

START TRANSACTION;

CALL AdjustBuildingCosts(1);
SELECT * FROM building_cost;

ROLLBACK;