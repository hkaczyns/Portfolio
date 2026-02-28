CREATE TABLE users
(
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(255) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE sessions
(
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



CREATE TABLE fractions
(
    fraction_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE players
(
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    fraction_id INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id),
    FOREIGN KEY (fraction_id) REFERENCES fractions(fraction_id)
);



CREATE TABLE territories (
    territory_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    territory_type VARCHAR(255) NOT NULL,
    description TEXT,
    geography VARCHAR(255) NOT NULL,
    x INT,
    y INT,
    panel_img VARCHAR(255)
);

CREATE TABLE fraction_starting_territories (
    fraction_starting_territories_id INT AUTO_INCREMENT PRIMARY KEY,
    fraction_id INT NOT NULL,
    territory_id INT NOT NULL,
    FOREIGN KEY (fraction_id) REFERENCES fractions(fraction_id),
    FOREIGN KEY (territory_id) REFERENCES territories(territory_id)
);


CREATE TABLE territory_ownership
(
    ownership_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id   INT NOT NULL,
    territory_id INT NOT NULL,
    player_id    INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id),
    FOREIGN KEY (territory_id) REFERENCES territories (territory_id),
    FOREIGN KEY (player_id) REFERENCES players (player_id)
);

CREATE TABLE buildings_info (
    building_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    building_img VARCHAR(255)
);


CREATE TABLE constructions
(
    construction_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id      INT NOT NULL,
    territory_id    INT NOT NULL,
    building_id     INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id),
    FOREIGN KEY (territory_id) REFERENCES territories (territory_id),
    FOREIGN KEY (building_id) REFERENCES buildings_info (building_id)
);


CREATE TABLE resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource_img VARCHAR(255)
);

CREATE TABLE territory_base_resources (
    territory_base_resources_id INT AUTO_INCREMENT PRIMARY KEY,
    territory_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (territory_id) REFERENCES territories(territory_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);


CREATE TABLE building_cost (
    building_cost_id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    resource_id INT NOT NULL,
    cost INT NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings_info(building_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE building_production (
    building_production_id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    resource_id INT NOT NULL,
    production INT NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings_info(building_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE building_upkeep (
    building_upkeep_id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL,
    resource_id INT NOT NULL,
    upkeep INT NOT NULL,
    FOREIGN KEY (building_id) REFERENCES buildings_info(building_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);


CREATE TABLE player_resources (
    player_resources_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    resource_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE unit_types (
    unit_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    offensive_strength INT,
    defensive_strength INT,
    unit_img VARCHAR(255)
);

CREATE TABLE unit_cost (
    unit_cost_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    resource_id INT NOT NULL,
    cost INT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES unit_types(unit_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);

CREATE TABLE unit_upkeep (
    unit_upkeep_id INT AUTO_INCREMENT PRIMARY KEY,
    unit_id INT NOT NULL,
    resource_id INT NOT NULL,
    upkeep INT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES unit_types(unit_id),
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id)
);


CREATE TABLE armies
(
    army_id      INT AUTO_INCREMENT PRIMARY KEY,
    session_id   INT NOT NULL,
    player_id    INT NOT NULL,
    unit_type    INT NOT NULL,
    unit_count   INT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions (session_id),
    FOREIGN KEY (player_id) REFERENCES players (player_id),
    FOREIGN KEY (unit_type) REFERENCES unit_types (unit_id)
);

CREATE TABLE battles
(
    battle_id        INT AUTO_INCREMENT PRIMARY KEY,
    session_id       INT NOT NULL,
    location_id      INT NOT NULL,
    attacker_army_id INT NOT NULL,
    defender_army_id INT NOT NULL,
    outcome          VARCHAR(255),
    FOREIGN KEY (session_id) REFERENCES sessions (session_id),
    FOREIGN KEY (location_id) REFERENCES territories (territory_id),
    FOREIGN KEY (attacker_army_id) REFERENCES armies (army_id),
    FOREIGN KEY (defender_army_id) REFERENCES armies (army_id)
);