CREATE TRIGGER after_battle_territory_reasign
    AFTER INSERT on battles
    FOR EACH ROW
BEGIN
    IF NEW.outcome = 'ATTACKER VICTORY' THEN
    UPDATE territory_ownership Set player_id = NEW.attacker_army_id
    WHERE session_id = NEW.session_id AND territory_id=NEW.location_id;
end if;
END;

CREATE function calculate_offensive_strength(player_id int, s_id int) RETURNS int DETERMINISTIC
BEGIN
    DECLARE pl_id int;
    DECLARE strength int;
    DECLARE size int;
    DECLARE session_v int;
    declare total int DEFAULT  0;
    DECLARE done BOOL DEFAULT FALSE;
    DECLARE army_cr CURSOR FOR
SELECT a.player_id, a.unit_count, a.session_id, u.offensive_strength FROM armies a
                                                                              JOIN unit_types u ON (u.unit_id = a.unit_type);
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
open army_cr;
base_loop: LOOP
        FETCH army_cr INTO pl_id, strength, session_v, size;
        if done THEN
            LEAVE base_loop;
end if;
        if pl_id = player_id and session_v = s_id THEN
            SET total = total +(strength*size);
end if;
end loop;
    IF total IS NULL THEN
        set total = 0;
end if;
RETURN total;
end;

CREATE function calculate_defensive_strength(player_id int, s_id int) RETURNS int DETERMINISTIC
BEGIN
    DECLARE pl_id int;
    DECLARE strength int;
    DECLARE size int;
    DECLARE session_v int;
    declare total int DEFAULT  0;
    DECLARE done BOOL DEFAULT FALSE;
    DECLARE army_cr CURSOR FOR
SELECT a.player_id, a.unit_count, a.session_id, u.defensive_strength FROM armies a
                                                                              JOIN unit_types u ON (u.unit_id = a.unit_type);
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
open army_cr;
base_loop: LOOP
        FETCH army_cr INTO pl_id, strength, session_v, size;
        if done THEN
            LEAVE base_loop;
end if;
        if pl_id = player_id and session_v = s_id THEN
            SET total = total +(strength*size);
end if;
end loop;
    IF total IS NULL THEN
        set total = 0;
end if;
RETURN total;
end;


CREATE function calculate_battle_result(attacker_id int, defender_id int, s_id int) RETURNS int DETERMINISTIC
-- 1 = attacker victory, 0 = draw, -1 = defender victory
BEGIN
    DECLARE offensive int;
    DECLARE defensive int;
    DECLARE result int;
    SET offensive = calculate_offensive_strength(attacker_id, s_id);
    SET defensive = calculate_defensive_strength(defender_id, s_id);
    IF defensive > offensive THEN
        SET result = -1;
    ELSEIF defensive*1.5 > offensive THEN
        SET result = 0;
ELSE
        SET result = 1;
end if;
RETURN result;
end;

SELECT calculate_battle_result(3, 1, 1) FROM dual;
SELECT calculate_battle_result(1, 1, 1) FROM dual;
SELECT calculate_battle_result(1, 3, 1) FROM dual;
select calculate_defensive_strength(1, 1) FROM dual;
select calculate_offensive_strength(1, 1) FROM dual;
select calculate_defensive_strength(3, 1) FROM dual;
select calculate_offensive_strength(3, 1) FROM dual;

SELECT * FROM territory_ownership;
INSERT INTO battles (session_id, location_id, attacker_army_id, defender_army_id, outcome)
VALUES (1, 9, 1, 4, 'ATTACKER_VICTORY');


SELECT t.unit_id, t.name, t.offensive_strength, t.defensive_strength, c.cost, r.name FROM unit_types t
    JOIN unit_cost c USING (unit_id)
    JOIN resources r USING (resource_id)
ORDER BY t.name;

