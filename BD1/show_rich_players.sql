-- Wyświetl graczy, którzy mają więcej danego zasobu niż wynosi średnia w sesji.

UPDATE player_resources
SET quantity = quantity + 500
WHERE player_resources_id % 3 = 1;

UPDATE player_resources
SET quantity = quantity - 500
WHERE player_resources_id % 3 = 2;

SELECT * FROM player_resources;

WITH session_averages AS (
    SELECT
        pr.resource_id,
        p.session_id,
        r.name AS resource_name,
        AVG(pr.quantity) AS avg_quantity
    FROM player_resources pr
             JOIN players p ON pr.player_id = p.player_id
             JOIN resources r ON pr.resource_id = r.resource_id
    GROUP BY pr.resource_id, p.session_id, r.name
)

SELECT
    p.player_id,
    p.session_id,
    f.name AS fraction_name,
    r.name AS resource_name,
    pr.quantity AS player_quantity,
    sa.avg_quantity AS session_average,
    pr.quantity - sa.avg_quantity AS difference
FROM player_resources pr
         JOIN players p ON pr.player_id = p.player_id
         JOIN fractions f ON p.fraction_id = f.fraction_id
         JOIN resources r ON pr.resource_id = r.resource_id
         JOIN session_averages sa ON
    sa.resource_id = pr.resource_id
        AND sa.session_id = p.session_id
WHERE pr.quantity >= sa.avg_quantity
ORDER BY
    p.player_id,
    r.name;