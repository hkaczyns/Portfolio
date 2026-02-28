--oblicza licbę jednostek danego gracza
SELECT p.player_id, p.session_id, sum(a.unit_count) FROM players p
                                                             JOIN armies a USING (player_id)
GROUP BY p.player_id, p.session_id
order by sum(a.unit_count) DESC;

--oblicza łączne koszty jednostek z podziałem na zasoby
SELECT p.player_id, p.session_id, r.name, SUM(a.unit_count*u.upkeep) FROM players p
                                                                              JOIN armies a USING (player_id)
                                                                              JOIN unit_upkeep u ON (u.unit_id = a.unit_type)
                                                                              JOIN resources r USING (resource_id)
GROUP BY p.player_id, p.session_id, r.name
ORDER BY SUM(a.unit_count*u.upkeep) desc

    INSERT INTO armies (session_id, player_id, unit_type, unit_count)
VALUES (1, 1, 5, 5);

-- pokazuje graczy których wartosć siły ofensywnej armii jest większa od jej siły defensywnej
SELECT p.player_id, p.session_id, SUM(a.unit_count*u.offensive_strength) offensive
FROM players p
         JOIN armies a USING (player_id)
         JOIN unit_types u ON (u.unit_id = a.unit_type)
GROUP BY p.player_id, p.session_id
HAVING offensive > (
    SELECT SUM(a1.unit_count*u1.defensive_strength)
    FROM armies a1
             JOIN unit_types u1 ON (u1.unit_id = a1.unit_type)
    WHERE a1.player_id = p.player_id
);

-- pokazuje graczy którzy mają więcej jednostek niż budynków
SELECT p.player_id, p.session_id, SUM(a.unit_count) units_count
FROM players p
         JOIN armies a USING (player_id)
GROUP BY p.player_id, p.session_id
HAVING units_count > (
    SELECT count(c1.construction_id)
    FROM constructions c1
             JOIN territory_ownership t1 using (territory_id)
             JOIN players p1 USING (player_id)
    WHERE p1.player_id = p.player_id
);