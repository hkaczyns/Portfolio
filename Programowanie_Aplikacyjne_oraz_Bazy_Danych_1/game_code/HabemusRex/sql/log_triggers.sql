# TRIGGERS FOR LOGS TABLE

CREATE TRIGGER user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('users', NEW.user_id, 'INSERT');
END;

CREATE TRIGGER user_update
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('users', NEW.user_id, 'UPDATE');
END;

CREATE TRIGGER user_delete
    BEFORE DELETE ON users
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('users', OLD.user_id, 'DELETE');
END;

CREATE TRIGGER armies_insert
AFTER INSERT ON armies
FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('armies', NEW.army_id, 'INSERT');
END;

CREATE TRIGGER armies_update
    AFTER UPDATE ON armies
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('armies', NEW.army_id, 'UPDATE');
END;

CREATE TRIGGER armies_delete
    BEFORE DELETE ON armies
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('armies', OLD.army_id, 'DELETE');
END;

CREATE TRIGGER battles_insert
    AFTER INSERT ON battles
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('battles', NEW.battle_id, 'INSERT');
END;

CREATE TRIGGER battles_update
    AFTER UPDATE ON battles
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('battles', NEW.battle_id, 'UPDATE');
END;

CREATE TRIGGER battles_delete
    BEFORE DELETE ON battles
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('battles', OLD.battle_id, 'DELETE');
END;

CREATE TRIGGER constructions_insert
    AFTER INSERT ON constructions
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('constructions', NEW.construction_id, 'INSERT');
END;

CREATE TRIGGER constructions_update
    AFTER UPDATE ON constructions
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('constructions', NEW.construction_id, 'UPDATE');
END;

CREATE TRIGGER constructions_delete
    BEFORE DELETE ON constructions
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('constructions', OLD.construction_id, 'DELETE');
END;

CREATE TRIGGER players_insert
    AFTER INSERT ON players
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('players', NEW.player_id, 'INSERT');
END;

CREATE TRIGGER players_update
    AFTER UPDATE ON players
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('players', NEW.player_id, 'UPDATE');
END;

CREATE TRIGGER players_delete
    BEFORE DELETE ON players
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('players', OLD.player_id, 'DELETE');
END;

CREATE TRIGGER player_resources_insert
    AFTER INSERT ON player_resources
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('players_resources', NEW.player_resources_id, 'INSERT');
END;

CREATE TRIGGER player_resources_update
    AFTER UPDATE ON player_resources
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('players_resources', NEW.player_resources_id, 'UPDATE');
END;

CREATE TRIGGER player_resources_delete
    BEFORE DELETE ON player_resources
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('players_resources', OLD.player_resources_id, 'DELETE');
END;

CREATE TRIGGER territory_ownership_insert
    AFTER INSERT ON territory_ownership
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('territory_ownership', NEW.ownership_id, 'INSERT');
END;

CREATE TRIGGER territory_ownership_update
    AFTER UPDATE ON territory_ownership
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('territory_ownership', NEW.ownership_id, 'UPDATE');
END;

CREATE TRIGGER territory_ownership_delete
    BEFORE DELETE ON territory_ownership
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('sessions', OLD.ownership_id, 'DELETE');
END;

CREATE TRIGGER sessions_insert
    AFTER INSERT ON sessions
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('sessions', NEW.session_id, 'INSERT');
END;

CREATE TRIGGER sessions_update
    AFTER UPDATE ON sessions
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('sessions', NEW.session_id, 'UPDATE');
END;

CREATE TRIGGER sessions_delete
    BEFORE DELETE ON sessions
    FOR EACH ROW
BEGIN
    INSERT INTO logs (table_name, record_id, action)
    VALUES ('sessions', OLD.session_id, 'DELETE');
END;


# TESTS FOR LOGS TRIGGERS

SELECT * FROM logs;

SELECT * FROM logs JOIN users ON record_id = user_id WHERE table_name = 'users';

INSERT INTO users (name)
VALUES ('John Doe');

UPDATE users
SET name = 'Andrzej Duda'
WHERE name = 'John Doe';

DELETE FROM users
WHERE name = 'Andrzej Duda';

SELECT * FROM logs WHERE table_name = 'users';

SELECT * FROM logs JOIN armies ON record_id = army_id WHERE table_name = 'armies';
SELECT * FROM logs JOIN battles ON record_id = battle_id WHERE table_name = 'battles';
SELECT * FROM logs JOIN constructions ON record_id = construction_id WHERE table_name = 'constructions';
SELECT * FROM logs JOIN players ON record_id = player_id WHERE table_name = 'players';
SELECT * FROM logs JOIN player_resources ON record_id = player_resources_id WHERE table_name = 'players_resources';
SELECT * FROM logs JOIN territory_ownership ON record_id = ownership_id WHERE table_name = 'territory_ownership';
SELECT * FROM logs JOIN sessions ON record_id = session_id WHERE table_name = 'sessions';

# LOGS TRIGGERS DROPS

DROP TRIGGER IF EXISTS user_insert;
DROP TRIGGER IF EXISTS user_update;
DROP TRIGGER IF EXISTS user_delete;

DROP TRIGGER IF EXISTS armies_insert;
DROP TRIGGER IF EXISTS armies_update;
DROP TRIGGER IF EXISTS armies_delete;

DROP TRIGGER IF EXISTS battles_insert;
DROP TRIGGER IF EXISTS battles_update;
DROP TRIGGER IF EXISTS battles_delete;

DROP TRIGGER IF EXISTS constructions_insert;
DROP TRIGGER IF EXISTS constructions_update;
DROP TRIGGER IF EXISTS constructions_delete;

DROP TRIGGER IF EXISTS players_insert;
DROP TRIGGER IF EXISTS players_update;
DROP TRIGGER IF EXISTS players_delete;

DROP TRIGGER IF EXISTS player_resources_insert;
DROP TRIGGER IF EXISTS player_resources_update;
DROP TRIGGER IF EXISTS player_resources_delete;

DROP TRIGGER IF EXISTS territory_ownership_insert;
DROP TRIGGER IF EXISTS territory_ownership_update;
DROP TRIGGER IF EXISTS territory_ownership_delete;

DROP TRIGGER IF EXISTS sessions_insert;
DROP TRIGGER IF EXISTS sessions_update;
DROP TRIGGER IF EXISTS sessions_delete;
