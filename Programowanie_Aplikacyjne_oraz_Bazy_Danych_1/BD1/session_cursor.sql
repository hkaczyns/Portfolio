# PROCEDURE TO DELETE REDUNDANT SESSIONS WITH CURSOR
CREATE PROCEDURE reduce_sessions(IN max_session_amount INT)
BEGIN
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_user_id INT;
    DECLARE v_user_name VARCHAR(255);
    DECLARE v_session_amount INT;
    DECLARE v_session_amount_to_delete INT;

    DECLARE CR CURSOR FOR
        SELECT user_id, name FROM users;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    IF max_session_amount IS NULL THEN
        SET max_session_amount = 2;
    END IF;

    OPEN CR;

    session_loop: LOOP

        FETCH CR INTO v_user_id, v_user_name;

        IF v_done THEN
            LEAVE session_loop;
        END IF;

        SELECT COUNT(*) INTO v_session_amount
        FROM sessions
        WHERE user_id = v_user_id;

        SET v_session_amount_to_delete = v_session_amount - max_session_amount;

        IF v_session_amount_to_delete > 0 THEN
            DELETE FROM sessions
            WHERE user_id = v_user_id
            ORDER BY session_id
            LIMIT v_session_amount_to_delete;
            SELECT CONCAT('Deleted ', v_session_amount_to_delete, ' redundant sessions for user with name: ', v_user_name) AS LOG;
        ELSE
            SELECT CONCAT('No redundant sessions for user with name: ', v_user_name) AS LOG;
        END IF;

    END LOOP;

    CLOSE CR;
END;

# TESTS FOR PROCEDURE WITH CURSOR
INSERT INTO users (name) VALUES ('John Doe');
SELECT user_id INTO @user_id FROM users WHERE name = 'John Doe' LIMIT 1;

INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);

SELECT * FROM sessions JOIN users USING (user_id) WHERE user_id = @user_id;

CALL reduce_sessions(NULL);

SELECT * FROM sessions JOIN users USING (user_id) WHERE user_id = @user_id;

INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);
INSERT INTO sessions (user_id) VALUES (@user_id);

SELECT * FROM sessions JOIN users USING (user_id) WHERE user_id = @user_id;

CALL reduce_sessions(5);

SELECT * FROM sessions JOIN users USING (user_id) WHERE user_id = @user_id;

DELETE FROM sessions WHERE user_id = @user_id;
DELETE FROM users WHERE user_id = @user_id;

SET @user_id = NULL;

DROP PROCEDURE IF EXISTS reduce_sessions;