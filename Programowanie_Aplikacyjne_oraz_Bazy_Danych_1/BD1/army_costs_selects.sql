# Unit name, cost and resource
SELECT ut.name, rc.name, uc.cost FROM unit_types ut JOIN unit_cost uc USING (unit_id) JOIN resources rc USING (resource_id);

# The most expensive unit with gold resource
SELECT ut.name AS unit_name, rc.name AS resource_name, uc.cost
FROM unit_types ut
         JOIN unit_cost uc USING (unit_id)
         JOIN resources rc USING (resource_id)
WHERE rc.name = 'Złoto'
ORDER BY uc.cost DESC
LIMIT 1;

# The cheapest unit with iron resource
SELECT ut.name AS unit_name, rc.name AS resource_name, uc.cost
FROM unit_types ut
         JOIN unit_cost uc USING (unit_id)
         JOIN resources rc USING (resource_id)
WHERE rc.name = 'Żelazo'
ORDER BY uc.cost ASC
LIMIT 1;

# Units with gold resource costing above average
SELECT ut.name AS unit_name, rc.name AS resource_name, uc.cost
FROM unit_types ut
         JOIN unit_cost uc USING (unit_id)
         JOIN resources rc USING (resource_id)
WHERE rc.name = 'Złoto'
  AND uc.cost > (
    SELECT AVG(uc2.cost)
    FROM unit_cost uc2
             JOIN resources rc2 USING (resource_id)
    WHERE rc2.name = 'Złoto'
);

# Units with iron resource costing below average
SELECT ut.name AS unit_name, rc.name AS resource_name, uc.cost
FROM unit_types ut
         JOIN unit_cost uc USING (unit_id)
         JOIN resources rc USING (resource_id)
WHERE rc.name = 'Żelazo'
  AND uc.cost < (
    SELECT AVG(uc2.cost)
    FROM unit_cost uc2
             JOIN resources rc2 USING (resource_id)
    WHERE rc2.name = 'Żelazo'
);

# The most expensive unit for each resource
SELECT ut.name AS unit_name, rc.name AS resource_name, uc.cost
FROM unit_types ut
         JOIN unit_cost uc ON ut.unit_id = uc.unit_id
         JOIN resources rc ON uc.resource_id = rc.resource_id
WHERE uc.cost = (
    SELECT MAX(uc2.cost)
    FROM unit_cost uc2
    WHERE uc2.resource_id = rc.resource_id
);

# The cheapest unit for each resource
SELECT ut.name AS unit_name, rc.name AS resource_name, uc.cost
FROM unit_types ut
         JOIN unit_cost uc ON ut.unit_id = uc.unit_id
         JOIN resources rc ON uc.resource_id = rc.resource_id
WHERE uc.cost = (
    SELECT MIN(uc2.cost)
    FROM unit_cost uc2
    WHERE uc2.resource_id = rc.resource_id
);

# Players with the most gold
SELECT p.player_id, rc.name AS resource_name, pr.quantity
FROM players p
         JOIN player_resources pr ON p.player_id = pr.player_id
         JOIN resources rc ON pr.resource_id = rc.resource_id
WHERE rc.name = 'Złoto'
  AND pr.quantity = (
    SELECT MAX(pr2.quantity)
    FROM player_resources pr2
             JOIN resources rc2 ON pr2.resource_id = rc2.resource_id
    WHERE rc2.name = 'Złoto'
);

# Display all players with their resources and quantities
SELECT p.player_id, rc.name, pr.quantity FROM players p JOIN player_resources pr USING (player_id) JOIN resources rc USING (resource_id);

# Find the player with the highest quantity of gold
SELECT p.player_id, rc.name, pr.quantity FROM players p JOIN player_resources pr USING (player_id) JOIN resources rc USING (resource_id)
WHERE rc.name = 'Złoto'
ORDER BY pr.quantity DESC
LIMIT 1;

