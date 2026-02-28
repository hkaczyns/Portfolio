-- Funkcja obliczająca wypadkowy przychód i koszty dla gracza dla podanego surowca
CREATE FUNCTION calculate_player_net_income(player_id INT, resource_id INT) RETURNS DECIMAL(10, 2) DETERMINISTIC
BEGIN
    DECLARE total_building_income DECIMAL(10, 2) DEFAULT 0;
    DECLARE total_building_upkeep DECIMAL(10, 2) DEFAULT 0;
    DECLARE total_unit_upkeep DECIMAL(10, 2) DEFAULT 0;

-- Oblicz przychód z budynków posiadanych przez gracza dla danego surowca
    SELECT COALESCE(SUM(bp.production), 0)
    INTO total_building_income
    FROM constructions c
             JOIN building_production bp ON c.building_id = bp.building_id
             JOIN territory_ownership tos ON c.territory_id = tos.territory_id
    WHERE tos.player_id = player_id AND bp.resource_id = resource_id;

-- Oblicz koszt utrzymania budynków dla danego surowca
    SELECT COALESCE(SUM(bu.upkeep), 0)
    INTO total_building_upkeep
    FROM constructions c
             JOIN building_upkeep bu ON c.building_id = bu.building_id
             JOIN territory_ownership tos ON c.territory_id = tos.territory_id
    WHERE tos.player_id = player_id AND bu.resource_id = resource_id;

-- Oblicz koszt utrzymania armii dla danego surowca
    SELECT COALESCE(SUM(uu.upkeep * a.unit_count), 0)
    INTO total_unit_upkeep
    FROM armies a
             JOIN unit_upkeep uu ON a.unit_type = uu.unit_id
    WHERE a.player_id = player_id AND uu.resource_id = resource_id
    GROUP BY uu.resource_id;

-- Zwróć wypadkową wartość (przychód - koszty)
    RETURN total_building_income - total_building_upkeep - total_unit_upkeep;
END;

-- Procedura usuwająca budynki gracza, których utrzymanie jest niemożliwe dla danego surowca
CREATE PROCEDURE remove_unmaintainable_buildings(player_id INT, resource_id INT)
BEGIN
    DECLARE net_resource DECIMAL(10, 2);
    DECLARE building_to_remove INT;
    DECLARE row_count INT;

    resource_check: LOOP
        -- Oblicz bieżący bilans surowca
        SELECT calculate_player_net_income(player_id, resource_id) INTO net_resource;

        -- Jeśli bilans jest nieujemny, zakończ pętlę
        IF net_resource >= 0 THEN
            LEAVE resource_check;
        END IF;

        -- Znajdź budynek do usunięcia
        SELECT c.construction_id
        INTO building_to_remove
        FROM constructions c
                 JOIN building_upkeep bu ON c.building_id = bu.building_id
                 JOIN territory_ownership tos ON c.territory_id = tos.territory_id
        WHERE tos.player_id = player_id AND bu.resource_id = resource_id
        ORDER BY bu.upkeep DESC
        LIMIT 1;

        SELECT ROW_COUNT() INTO row_count;

        -- Usuń znaleziony budynek
        DELETE FROM constructions
        WHERE construction_id = building_to_remove;

        -- Jeśli nie ma więcej pasujących budynków, zakończ pętlę
        IF row_count = 0 THEN
            LEAVE resource_check;
        END IF;
    END LOOP;
END;

-- Procedura usuwająca jednostki gracza, których utrzymanie jest niemożliwe dla danego surowca
CREATE PROCEDURE remove_unmaintainable_units(player_id INT, resource_id INT)
BEGIN
    DECLARE net_resource DECIMAL(10, 2);
    DECLARE army_to_update INT;
    DECLARE row_count INT;

    resource_check: LOOP
        -- Oblicz bieżący bilans surowca
        SELECT calculate_player_net_income(player_id, resource_id) INTO net_resource;

        -- Jeśli bilans jest nieujemny, zakończ pętlę
        IF net_resource >= 0 THEN
            LEAVE resource_check;
        END IF;

        -- Znajdź jednostkę do zmniejszenia liczebności
        SELECT a.army_id
        INTO army_to_update
        FROM armies a
                 JOIN unit_upkeep uu ON a.unit_type = uu.unit_id
        WHERE a.player_id = player_id AND uu.resource_id = resource_id
        ORDER BY uu.upkeep DESC
        LIMIT 1;

        SELECT ROW_COUNT() INTO row_count;

        -- Zmniejsz liczebność jednostki
        UPDATE armies
        SET unit_count = unit_count - 1
        WHERE army_id = army_to_update AND unit_count > 0;

        -- Usuń wpis jednostki, jeśli liczba jednostek spadła do zera
        DELETE FROM armies
        WHERE unit_count = 0;

        -- Jeśli nie ma więcej pasujących jednostek do usunięcia, zakończ pętlę
        IF row_count = 0 THEN
            LEAVE resource_check;
        END IF;
    END LOOP;
END;

-- Skrypt testujący funkcję calculate_player_net_income
-- Test 1: Oblicz wypadkowy wynik dla złota
SELECT calculate_player_net_income(1, 1) AS net_gold_income;

-- Test 2: Oblicz wypadkowy wynik dla żelaza
SELECT calculate_player_net_income(1, 2) AS net_iron_income;

-- Test 3: Oblicz wypadkowy wynik dla drewna
SELECT calculate_player_net_income(1, 3) AS net_wood_income;

-- Test 4: Oblicz wypadkowy wynik dla kamienia
SELECT calculate_player_net_income(1, 4) AS net_stone_income;

-- Test 5: Wypadkowy dochód dla jedzenia
SELECT calculate_player_net_income(1, 5) AS net_food_income;

-- Sprawdzenie testów 1: Lista budynków gracza wraz z ich produkcją
SELECT c.construction_id AS building_id, bi.name AS building_name, bp.production AS production, r.name AS resource, tos.territory_id AS territory_id
FROM constructions c
         JOIN buildings_info bi ON c.building_id = bi.building_id
         JOIN building_production bp ON c.building_id = bp.building_id
         JOIN territory_ownership tos ON c.territory_id = tos.territory_id
         JOIN resources r ON bp.resource_id = r.resource_id
WHERE tos.player_id = 1
ORDER BY bp.resource_id;

-- Sprawdzenie testów 2: Lista budynków gracza wraz z ich utrzymaniem
SELECT c.construction_id AS building_id, bi.name AS building_name, bu.upkeep AS upkeep, r.name AS resource, tos.territory_id AS territory_id
FROM constructions c
         JOIN buildings_info bi ON c.building_id = bi.building_id
         JOIN building_upkeep bu ON c.building_id = bu.building_id
         JOIN territory_ownership tos ON c.territory_id = tos.territory_id
         JOIN resources r ON bu.resource_id = r.resource_id
WHERE tos.player_id = 1
ORDER BY bu.resource_id;

-- Sprawdzenie testów 3: Lista jednostek gracza wraz z ich utrzymaniem
SELECT uu.upkeep AS upkeep, r.name AS resource, a.unit_count AS unit_count, ut.name AS unit
FROM armies a
         JOIN unit_upkeep uu ON a.unit_type = uu.unit_id
         JOIN unit_types ut ON a.unit_type = ut.unit_id
         JOIN resources r ON uu.resource_id = r.resource_id
WHERE a.player_id = 1
ORDER BY uu.resource_id;

-- Skrypt testujący procedurę usuwania budynków
-- Sprawdzenie budynków przed procedurą
SELECT c.construction_id AS building_id, bi.name AS building, r.name AS resource, bu.upkeep AS upkeep
FROM constructions c
         JOIN building_upkeep bu ON c.building_id = bu.building_id
         JOIN territory_ownership tos ON c.territory_id = tos.territory_id
         JOIN resources r ON bu.resource_id = r.resource_id
         JOIN buildings_info bi ON c.building_id = bi.building_id
WHERE tos.player_id = 1
ORDER BY bu.resource_id;

SELECT * FROM constructions;

-- Test 1: Uruchomienie procedury usuwania budynków dla złota
CALL remove_unmaintainable_buildings(1, 1);

-- Test 2: Uruchomienie procedury usuwania budynków dla żelaza
CALL remove_unmaintainable_buildings(1, 2);

-- Test 3: Uruchomienie procedury usuwania budynków dla drewna
CALL remove_unmaintainable_buildings(1, 3);

-- Test 4: Uruchomienie procedury usuwania budynków dla kamienia
CALL remove_unmaintainable_buildings(1, 4);

-- Test 5: Uruchomienie procedury usuwania budynków dla jedzenia
CALL remove_unmaintainable_buildings(1, 5);

-- Sprawdzenie budynków po procedurze
SELECT c.construction_id AS building_id, bi.name AS building, r.name AS resource, bu.upkeep AS upkeep
FROM constructions c
         JOIN building_upkeep bu ON c.building_id = bu.building_id
         JOIN territory_ownership tos ON c.territory_id = tos.territory_id
         JOIN resources r ON bu.resource_id = r.resource_id
         JOIN buildings_info bi ON c.building_id = bi.building_id
WHERE tos.player_id = 1
ORDER BY bu.resource_id;

SELECT * FROM constructions;

-- Skrypt testujący procedurę usuwania jednostek
-- Sprawdzenie jednostek gracza przed procedurą
SELECT uu.upkeep AS cost, r.name AS resource, a.unit_count AS unit_count, ut.name AS unit_name
FROM armies a
         JOIN unit_upkeep uu ON a.unit_type = uu.unit_id
         JOIN unit_types ut ON a.unit_type = ut.unit_id
         JOIN resources r ON uu.resource_id = r.resource_id
WHERE a.player_id = 1
ORDER BY uu.resource_id;

SELECT * FROM armies;

-- Test 1: Uruchomienie procedury usuwania jednostek dla złota
CALL remove_unmaintainable_units(1, 1);

-- Test 2: Uruchomienie procedury usuwania jednostek dla żelaza
CALL remove_unmaintainable_units(1, 2);

-- Test 3: Uruchomienie procedury usuwania jednostek dla drewna
CALL remove_unmaintainable_units(1, 3);

-- Test 4: Uruchomienie procedury usuwania jednostek dla kamienia
CALL remove_unmaintainable_units(1, 4);

-- Test 5: Uruchomienie procedury usuwania jednostek dla jedzenia
CALL remove_unmaintainable_units(1, 5);

-- Sprawdzenie jednostek gracza po procedurze
SELECT uu.upkeep AS cost, r.name AS resource, a.unit_count AS unit_count, ut.name AS unit_name
FROM armies a
         JOIN unit_upkeep uu ON a.unit_type = uu.unit_id
         JOIN unit_types ut ON a.unit_type = ut.unit_id
         JOIN resources r ON uu.resource_id = r.resource_id
WHERE a.player_id = 1
ORDER BY uu.resource_id;

SELECT * FROM armies;

DROP FUNCTION IF EXISTS calculate_player_net_income;
DROP PROCEDURE IF EXISTS remove_unmaintainable_buildings;
DROP PROCEDURE IF EXISTS remove_unmaintainable_units;
