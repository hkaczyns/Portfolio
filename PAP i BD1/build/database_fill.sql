SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO users (name)
VALUES ('Michał Wiśniewski');

INSERT INTO sessions (user_id)
VALUES (1);

INSERT INTO fractions (name, description)
VALUES ('Rzeczpospolita', 'Rzeczpospolita Obojga Narodów'),
       ('Prusy', 'Królestwo Prus'),
       ('Rosja', 'Carat rosyjski'),
       ('Austria', 'Imperium austriackie');


INSERT INTO players (session_id, type, fraction_id)
VALUES (1, 'USER', 1),
        (1, 'AI', 2),
        (1, 'AI', 3),
        (1, 'AI', 4);

INSERT INTO resources (name, description, resource_img)
VALUES ('Złoto', 'błyszczy się', 'gold.png'),
       ('Żelazo', 'zaiste twarde', 'iron.png'),
       ('Drewno', 'nie zostawiać na słońcu', 'wood.png'),
       ('Kamień', 'krucho to widzę', 'stone.png'),
       ('Jedzenie', 'na pustym brzuchu nie ma co', 'food.png');

INSERT INTO player_resources (player_id, resource_id, quantity)
VALUES (1, 1, 1000),
       (1, 2, 1000),
       (1, 3, 1000),
       (1, 4, 1000),
       (1, 5, 1000),
       (2, 1, 1000),
       (2, 2, 1000),
       (2, 3, 1000),
       (2, 4, 1000),
       (2, 5, 1000),
       (3, 1, 1000),
       (3, 2, 1000),
       (3, 3, 1000),
       (3, 4, 1000),
       (3, 5, 1000),
       (4, 1, 1000),
       (4, 2, 1000),
       (4, 3, 1000),
       (4, 4, 1000),
       (4, 5, 1000);

INSERT INTO territories (name, territory_type, description, geography, x, y, panel_img)
VALUES ('Warszawa', 'city', 'Stolica Polski', 'PLAINS', 2995, 1956, 'warsaw.png'),
       ('Kraków', 'city', 'Miasto polskie', 'PLAINS', 2952, 2210, 'krakow.png'),
       ('Gdańsk', 'city', 'Miasto polskie', 'PLAINS', 2900, 1752, NULL),
       ('Lwów', 'city', 'Miasto polskie', 'PLAINS', 3272, 2222, NULL),
       ('Wilno', 'city', 'Miasto polskie', 'PLAINS', 3362, 1719, NULL),
       ('Poznań', 'city', 'Miasto polskie', 'PLAINS', 2792, 1953, NULL),
       ('Berlin', 'city', 'Stolica Prus', 'PLAINS', 2564, 1927, 'berlin.png'),
       ('Königsberg', 'city', 'Miasto pruskie', 'PLAINS', 3040, 1721, NULL),
       ('Wiedeń', 'city', 'Stolica Austrii', 'PLAINS', 2755, 2376, NULL),
       ('Drezno', 'city', 'Miasto saksońskie', 'PLAINS', 2595, 2130, NULL),
       ('Monachium', 'city', 'Miasto bawarskie', 'PLAINS', 2440, 2393, NULL),
       ('Moskwa', 'city', 'Stolica Rosji', 'PLAINS', 4171, 1626, 'moscow.png'),
       ('Petersburg', 'city', 'Miasto rosyjskie', 'PLAINS', 3688, 1204, 'st_petersburg.png'),
       ('Kazań', 'city', 'Miasto rosyjskie', 'PLAINS', 4936, 1610, NULL);

INSERT INTO fraction_starting_territories (fraction_id, territory_id)
VALUES (1, 1),
       (1, 2),
       (1, 3),
       (1, 4),
       (1, 5),
       (1, 6),
       (2, 7),
       (2, 8),
       (2, 10),
       (3, 12),
       (3, 13),
       (3, 14),
       (4, 9),
       (4, 11);

INSERT INTO territory_ownership (session_id, territory_id, player_id)
VALUES (1, 1, 1),
       (1, 2, 1),
       (1, 3, 1),
       (1, 4, 1),
       (1, 5, 1),
       (1, 6, 1),
       (1, 7, 2),
       (1, 8, 2),
       (1, 10, 2),
       (1, 12, 3),
       (1, 13, 3),
       (1, 14, 3),
       (1, 9, 4),
       (1, 11, 4);


INSERT INTO territory_base_resources (territory_id, resource_id, quantity)
VALUES (1, 1, 200),
        (1, 2, 100);


INSERT INTO buildings_info (name, description, building_img)
VALUES ('Fortyfikacje', 'Zacny szaniec mospanie!', 'castle.png'),
       ('Katedra', 'Te Deum laudamus!', 'church.png'),
       ('Tartak', 'Bobrów nie obsługujemy', 'sawmill.png'),
       ('Kopalnia', 'Załóż kask!', 'mine.png'),
       ('Farma', 'Kwiatki i pszczółki', 'farm.png'),
       ('Kamieniołom', 'Uwaga na głowę!', 'quarry.png'),
       ('Uniwersytet', 'Tam gdzie żaki zimują', 'university.png'),
       ('Ratusz', 'Wzorowy a nawet wzorcowy', 'townhall.png'),
       ('Teatr', 'Chleba i igrzysk!', 'theater.png'),
       ('Targowisko', 'Grosza daj handlarzowi!', 'markethall.png'),
       ('Park', 'Nie dokarmiać zwierząt!', 'park.png'),
       ('Tawerna', 'Pwia z kija mnogo!', 'tavern.png');

INSERT INTO building_cost (building_id, resource_id, cost)
VALUES (1, 1, 200),
       (1, 2, 200),
       (2, 2, 200),
       (2, 3, 200),
       (3, 3, 200),
       (3, 4, 200),
       (4, 4, 200),
       (4, 5, 200),
       (5, 5, 200),
       (5, 1, 200),
       (6, 1, 200),
       (6, 3, 200),
       (7, 2, 200),
       (7, 4, 200),
       (8, 3, 200),
       (8, 5, 200),
       (9, 4, 200),
       (9, 1, 200),
       (10, 5, 200),
       (10, 2, 200),
       (11, 1, 200),
       (12, 1, 200);

INSERT INTO building_upkeep (building_id, resource_id, upkeep)
VALUES (1, 5, 20),
       (2, 4, 20),
       (3, 3, 20),
       (4, 2, 20),
       (5, 1, 20),
       (6, 5, 20),
       (7, 4, 20),
       (8, 3, 20),
       (9, 2, 20),
       (10, 1, 20),
       (11, 5, 20),
       (12, 4, 20);

INSERT INTO building_production (building_id, resource_id, production)
VALUES (1, 4, 30),
       (2, 3, 30),
       (3, 2, 30),
       (4, 1, 30),
       (5, 5, 30),
       (6, 4, 30),
       (7, 3, 30),
       (8, 2, 30),
       (9, 1, 30),
       (10, 5, 30),
       (11, 4, 30),
       (12, 3, 30);

INSERT INTO constructions (session_id, territory_id, building_id)
VALUES (1, 1, 1),
       (1, 2, 2),
       (1, 3, 3),
       (1, 2, 1),
       (1, 3, 2),
       (1, 4, 3),
       (1, 5, 4),
       (1, 6, 5),
       (1, 7, 6),
       (1, 8, 7),
       (1, 9, 8),
       (1, 10, 9),
       (1, 11, 10),
       (1, 12, 11),
       (1, 13, 12),
       (1, 14, 9),
       (1, 1, 12),
       (1, 1, 5),
       (1, 1, 6),
       (1, 1, 7),
       (1, 1, 8);

INSERT INTO unit_types (name, description, offensive_strength, defensive_strength, unit_img)
VALUES ('Biedna piechota', 'Każdy walczyć może', 5, 5, 'biedna_piechota.jpg'),
       ('Piechota liniowa', 'Ściana luf i bagnetów', 20, 20, 'line_infantry.jpg'),
       ('Elitarna piechota','Nieustraszeni grenadierzy', 40, 40,  'elite_infantry.jpg'),
       ('Pospolite ruszenie', 'Hajda na moskala!', 40, 40, 'pospolite_ruszenie.jpg'),
       ('Artyleria', 'OGNIA!!!', 150, 0, 'h_altilery.jpg'),
       ('Lekka kawaleria', 'Flanki ich nienawidzą', 20, 40, 'light_cavalery.jpg'),
       ('Husaria', 'Skarb i duma', 50, 80, 'hevy_cavalery.jpg');


INSERT INTO unit_cost (unit_id, resource_id, cost)
VALUES  (1, 5, 50),
        (2, 1, 50),
        (2, 3, 50),
        (3, 1, 100),
        (3, 2, 50),
        (4, 1, 50),
        (5, 1, 200),
        (5, 2, 100),
        (6, 1, 100),
        (6, 3, 50),
        (7, 1, 150),
        (7, 2, 100);

INSERT INTO unit_upkeep (unit_id, resource_id, upkeep)
VALUES (1, 5, 5),
       (2, 5, 10),
       (2, 1, 10),
       (3, 1, 25),
       (3, 5, 10),
       (4, 5, 40),
       (4, 1, 40),
       (5, 1, 40),
       (6, 1, 20),
       (6, 5, 20),
       (7, 1, 40),
       (7, 5, 20);

INSERT INTO armies (session_id, player_id, unit_type, unit_count)
VALUES (1, 1, 1, 1),
       (1, 1, 2, 2),
       (1, 2, 1, 1),
       (1, 3, 2, 2),
       (1, 4, 2, 2);

INSERT INTO battles (session_id, location_id, attacker_army_id, defender_army_id, outcome)
VALUES (1, 1, 1, 2, 'ATTACKER_VICTORY');