BEGIN;
-- Users
INSERT INTO "user"(id, email, hashed_password, is_active, is_superuser, is_verified, first_name, last_name, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'anna.kowalska@tiptap.pl', 'seeded-password-hash', TRUE, TRUE, TRUE, 'Anna', 'Kowalska', 'admin'),
('22222222-2222-2222-2222-222222222221', 'piotr.wisniewski@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Piotr', 'Wiśniewski', 'instructor'),
('22222222-2222-2222-2222-222222222222', 'joanna.zielinska@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Joanna', 'Zielińska', 'instructor'),
('22222222-2222-2222-2222-222222222223', 'tomasz.kowalczyk@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Tomasz', 'Kowalczyk', 'instructor'),
('33333333-3333-3333-3333-333333333331', 'jan.kowalski@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Jan', 'Kowalski', 'student'),
('33333333-3333-3333-3333-333333333332', 'natalia.kaminska@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Natalia', 'Kamińska', 'student'),
('33333333-3333-3333-3333-333333333333', 'kamil.krol@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Kamil', 'Król', 'student'),
('33333333-3333-3333-3333-333333333334', 'zuzanna.wieczorek@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Zuzanna', 'Wieczorek', 'student'),
('33333333-3333-3333-3333-333333333335', 'emilia.jablonska@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Emilia', 'Jabłońska', 'student'),
('33333333-3333-3333-3333-333333333336', 'oskar.jablonski@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Oskar', 'Jabłoński', 'student'),
('33333333-3333-3333-3333-333333333337', 'szymon.krol@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Szymon', 'Król', 'student'),
('33333333-3333-3333-3333-333333333338', 'maria.krol@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Maria', 'Król', 'student'),
('33333333-3333-3333-3333-333333333339', 'paulina.dabrowska@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Paulina', 'Dąbrowska', 'student'),
('33333333-3333-3333-3333-333333333340', 'krzysztof.wojcik@tiptap.pl', 'seeded-password-hash', TRUE, FALSE, TRUE, 'Krzysztof', 'Wójcik', 'student')
ON CONFLICT
    DO NOTHING;
-- Access tokens
INSERT INTO accesstoken(user_id, token, created_at)
    VALUES ('11111111-1111-1111-1111-111111111111', 'seeded-admin-token', '2026-01-18 08:00:00+00')
ON CONFLICT
    DO NOTHING;
-- Rooms
INSERT INTO room(id, name, capacity, description, is_available_for_rental, hourly_rate, is_active)
VALUES
    (1, 'Sala A', 18, 'Sala z lustrami i parkietem.', TRUE, 100.00, TRUE),
(2, 'Sala B', 16, 'Mniejsza sala do zajęć parowych.', FALSE, NULL, TRUE),
(3, 'Studio C', 20, 'Studio z nagłośnieniem.', TRUE, 120.00, TRUE),
(4, 'Sala D', 15, 'Kameralna sala do zajęć indywidualnych.', TRUE, 80.00, TRUE),
(5, 'Sala E', 25, 'Duża sala na warsztaty i eventy.', TRUE, 150.00, TRUE),
(6, 'Sala F', 10, 'Mała sala do zajęć specjalistycznych.', FALSE, NULL, TRUE)
ON CONFLICT
    DO NOTHING;
-- Skill levels
INSERT INTO skill_level(id, name, description)
VALUES
    (1, 'Początkujący', 'Pierwsze kroki i podstawy techniki.'),
(2, 'Średniozaawansowany', 'Utrwalenie kroków i praca z partnerem.'),
(3, 'Zaawansowany', 'Złożone kombinacje i stylizacja.'),
(4, 'Ekspert', 'Mistrzowskie techniki i improwizacja.')
ON CONFLICT
    DO NOTHING;
-- Topics
INSERT INTO topic(id, name, description)
VALUES
    (1, 'Salsa', 'Salsa liniowa i kubańska.'),
(2, 'Bachata', 'Bachata sensual i moderna.'),
(3, 'Hip-hop', 'Podstawy groove i choreografii.'),
(4, 'Taniec współczesny', 'Improwizacja i techniki tańca współczesnego.'),
(5, 'Jazz', 'Techniki jazzu i stylizacja.'),
(6, 'Balet', 'Podstawy baletu i postawa ciała.')
ON CONFLICT
    DO NOTHING;
-- Semesters
INSERT INTO semester(id, name, start_date, end_date, is_active, created_by)
VALUES
    (1, 'Semestr zimowy 2026', '2026-01-01', '2026-03-31', TRUE, '11111111-1111-1111-1111-111111111111'),
(2, 'Semestr wiosenny 2026', '2026-04-01', '2026-06-30', FALSE, '11111111-1111-1111-1111-111111111111'),
(3, 'Semestr letni 2026', '2026-07-01', '2026-09-30', FALSE, '11111111-1111-1111-1111-111111111111'),
(4, 'Semestr jesienny 2026', '2026-10-01', '2026-12-31', FALSE, '11111111-1111-1111-1111-111111111111')
ON CONFLICT
    DO NOTHING;
-- Class groups
INSERT INTO class_group(id, semester_id, name, description, level_id, topic_id, room_id, capacity, day_of_week, start_time, end_time, instructor_id, is_public, status)
VALUES
    (1, 1, 'Salsa podstawy A', 'Grupa dla początkujących, tempo spokojne.', 1, 1, 1, 18, 1, '18:00', '19:30', '22222222-2222-2222-2222-222222222221', TRUE, 'OPEN'),
(2, 1, 'Bachata średniozaaw.', 'Rozwijanie pracy w parze i izolacji.', 2, 2, 2, 16, 3, '19:00', '20:30', '22222222-2222-2222-2222-222222222222', TRUE, 'OPEN'),
(3, 1, 'Hip-hop open', 'Otwarte zajęcia z choreografii.', 1, 3, 3, 20, 5, '17:30', '19:00', '22222222-2222-2222-2222-222222222223', TRUE, 'OPEN'),
(4, 1, 'Salsa zaawansowany', 'Zaawansowane techniki i styling.', 3, 1, 1, 15, 4, '18:00', '19:30', '22222222-2222-2222-2222-222222222221', TRUE, 'OPEN'),
(5, 2, 'Bachata początkujący', 'Podstawy bachaty dla nowych uczniów.', 1, 2, 2, 16, 2, '18:00', '19:30', '22222222-2222-2222-2222-222222222222', TRUE, 'OPEN'),
(6, 2, 'Hip-hop średniozaawans.', 'Techniki hip-hopu i improwizacja.', 2, 3, 3, 20, 6, '17:00', '18:30', '22222222-2222-2222-2222-222222222223', TRUE, 'OPEN'),
(7, 1, 'Jazz dla każdego', 'Zajęcia z jazzu dla wszystkich poziomów.', 1, 5, 4, 15, 2, '17:00', '18:30', '22222222-2222-2222-2222-222222222221', TRUE, 'OPEN'),
(8, 1, 'Balet podstawy', 'Podstawy baletu i postawa ciała.', 1, 6, 5, 10, 3, '16:00', '17:30', '22222222-2222-2222-2222-222222222222', TRUE, 'OPEN')
ON CONFLICT
    DO NOTHING;
-- Class sessions
INSERT INTO class_session(id, class_group_id, date, start_time, end_time, status, instructor_id, room_id, notes, cancellation_reason, rescheduled_from_id)
VALUES
    (1, 1, '2026-01-03', '18:00', '19:30', 'completed', '22222222-2222-2222-2222-222222222221', 1, 'Pierwsze zajęcia semestru.', NULL, NULL),
(2, 1, '2026-01-10', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(3, 2, '2026-01-05', '19:00', '20:30', 'completed', '22222222-2222-2222-2222-222222222222', 2, 'Praca nad izolacjami.', NULL, NULL),
(4, 2, '2026-01-12', '19:00', '20:30', 'cancelled', '22222222-2222-2222-2222-222222222222', 2, NULL, 'Choroba instruktora.', NULL),
(6, 3, '2026-01-07', '17:30', '19:00', 'completed', '22222222-2222-2222-2222-222222222223', 3, 'Wprowadzenie do groove.', NULL, NULL),
(7, 3, '2026-01-14', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(8, 2, '2026-01-24', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(9, 2, '2026-01-27', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(10, 2, '2026-01-29', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(11, 2, '2026-02-01', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(12, 2, '2026-02-03', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(13, 2, '2026-02-05', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(14, 2, '2026-02-07', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(15, 2, '2026-02-10', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 2, NULL, NULL, NULL),
(16, 3, '2026-01-14', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(17, 3, '2026-01-21', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(18, 3, '2026-01-28', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(19, 3, '2026-02-04', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(20, 3, '2026-02-11', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(21, 3, '2026-02-18', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(22, 3, '2026-02-25', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(23, 3, '2026-03-03', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(24, 3, '2026-03-10', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222223', 3, NULL, NULL, NULL),
(25, 3, '2026-03-17', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222222', 3, NULL, NULL, NULL),
(26, 3, '2026-03-24', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222222', 3, NULL, NULL, NULL),
(27, 3, '2026-03-31', '17:30', '19:00', 'scheduled', '22222222-2222-2222-2222-222222222222', 3, NULL, NULL, NULL),
(28, 4, '2026-01-08', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(29, 4, '2026-01-15', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(30, 4, '2026-01-22', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(31, 4, '2026-01-29', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(32, 4, '2026-02-05', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(33, 4, '2026-02-12', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(34, 4, '2026-02-19', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(35, 4, '2026-02-26', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(36, 4, '2026-03-05', '18:00', '19:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 1, NULL, NULL, NULL),
(37, 4, '2026-03-12', '18:00', '19:30', 'scheduled', '11111111-1111-1111-1111-111111111111', 1, NULL, NULL, NULL),
(38, 7, '2026-01-13', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(39, 7, '2026-01-20', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(40, 7, '2026-01-27', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(41, 7, '2026-02-03', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(42, 7, '2026-02-10', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(43, 7, '2026-02-17', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(44, 7, '2026-02-24', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(45, 7, '2026-03-03', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(46, 7, '2026-03-10', '14:00', '15:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 4, NULL, NULL, NULL),
(47, 7, '2026-03-17', '14:00', '15:30', 'scheduled', '11111111-1111-1111-1111-111111111111', 4, NULL, NULL, NULL),
(48, 8, '2026-01-12', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 5, NULL, NULL, NULL),
(49, 8, '2026-01-19', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 5, NULL, NULL, NULL),
(50, 8, '2026-01-26', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 5, NULL, NULL, NULL),
(51, 8, '2026-02-02', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 5, NULL, NULL, NULL),
(52, 8, '2026-02-09', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 5, NULL, NULL, NULL),
(53, 8, '2026-02-16', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 5, NULL, NULL, NULL),
(54, 8, '2026-02-23', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 5, NULL, NULL, NULL),
(55, 8, '2026-03-02', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 5, NULL, NULL, NULL),
(56, 8, '2026-03-09', '10:00', '11:30', 'scheduled', '22222222-2222-2222-2222-222222222222', 5, NULL, NULL, NULL)
ON CONFLICT
    DO NOTHING;
INSERT INTO class_session(id, class_group_id, date, start_time, end_time, status, instructor_id, room_id, notes, cancellation_reason, rescheduled_from_id)
    VALUES (5, 2, '2026-01-14', '19:00', '20:30', 'scheduled', '22222222-2222-2222-2222-222222222221', 2, 'Zajęcia odrobione z zastępstwem.', NULL, 4)
ON CONFLICT
    DO NOTHING;
-- Instructor substitutions
INSERT INTO instructor_substitution(id, class_session_id, original_instructor_id, substitute_instructor_id, reason, created_by)
    VALUES (1, 5, '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222221', 'Zastępstwo z powodu choroby.', '11111111-1111-1111-1111-111111111111')
ON CONFLICT
    DO NOTHING;
-- Enrollments
INSERT INTO enrollment(id, student_id, class_group_id, status, joined_at, cancelled_at)
VALUES
    (1, '33333333-3333-3333-3333-333333333331', 1, 'ACTIVE', '2026-01-01 09:00:00+00', NULL),
(2, '33333333-3333-3333-3333-333333333332', 1, 'ACTIVE', '2026-01-01 09:10:00+00', NULL),
(3, '33333333-3333-3333-3333-333333333333', 1, 'ACTIVE', '2026-01-01 09:15:00+00', NULL),
(4, '33333333-3333-3333-3333-333333333339', 1, 'ACTIVE', '2026-01-02 11:00:00+00', NULL),
(5, '33333333-3333-3333-3333-333333333338', 1, 'ACTIVE', '2026-01-03 12:00:00+00', NULL),
(6, '33333333-3333-3333-3333-333333333335', 2, 'ACTIVE', '2026-01-01 09:30:00+00', NULL),
(7, '33333333-3333-3333-3333-333333333336', 2, 'CANCELLED', '2026-01-01 09:30:00+00', '2026-01-01 12:00:00+00'),
(8, '33333333-3333-3333-3333-333333333337', 2, 'ACTIVE', '2026-01-01 09:40:00+00', NULL),
(9, '33333333-3333-3333-3333-333333333340', 2, 'ACTIVE', '2026-01-01 09:45:00+00', NULL),
(10, '33333333-3333-3333-3333-333333333334', 3, 'ACTIVE', '2026-01-02 10:00:00+00', NULL),
(11, '33333333-3333-3333-3333-333333333333', 3, 'ACTIVE', '2026-01-02 10:05:00+00', NULL),
(12, '33333333-3333-3333-3333-333333333332', 3, 'ACTIVE', '2026-01-02 10:10:00+00', NULL)
ON CONFLICT
    DO NOTHING;
-- Attendance
INSERT INTO attendance(id, class_session_id, student_id, status, marked_by, marked_at, is_makeup)
VALUES
    (1, 1, '33333333-3333-3333-3333-333333333331', 'PRESENT', '22222222-2222-2222-2222-222222222221', '2026-01-03 19:40:00+00', FALSE),
(2, 1, '33333333-3333-3333-3333-333333333332', 'PRESENT', '22222222-2222-2222-2222-222222222221', '2026-01-03 19:40:00+00', FALSE),
(3, 1, '33333333-3333-3333-3333-333333333333', 'ABSENT', '22222222-2222-2222-2222-222222222221', '2026-01-03 19:40:00+00', FALSE),
(4, 2, '33333333-3333-3333-3333-333333333331', 'PRESENT', '22222222-2222-2222-2222-222222222221', '2026-01-10 19:35:00+00', FALSE),
(5, 2, '33333333-3333-3333-3333-333333333333', 'PRESENT', '22222222-2222-2222-2222-222222222221', '2026-01-10 19:35:00+00', FALSE),
(6, 2, '33333333-3333-3333-3333-333333333339', 'EXCUSED', '22222222-2222-2222-2222-222222222221', '2026-01-10 19:35:00+00', FALSE),
(7, 3, '33333333-3333-3333-3333-333333333335', 'PRESENT', '22222222-2222-2222-2222-222222222222', '2026-01-05 20:35:00+00', FALSE),
(8, 3, '33333333-3333-3333-3333-333333333337', 'PRESENT', '22222222-2222-2222-2222-222222222222', '2026-01-05 20:35:00+00', FALSE),
(9, 3, '33333333-3333-3333-3333-333333333340', 'ABSENT', '22222222-2222-2222-2222-222222222222', '2026-01-05 20:35:00+00', FALSE),
(10, 5, '33333333-3333-3333-3333-333333333335', 'PRESENT', '22222222-2222-2222-2222-222222222221', '2026-01-14 20:35:00+00', FALSE),
(11, 5, '33333333-3333-3333-3333-333333333340', 'PRESENT', '22222222-2222-2222-2222-222222222221', '2026-01-14 20:35:00+00', FALSE),
(12, 5, '33333333-3333-3333-3333-333333333336', 'PRESENT', '22222222-2222-2222-2222-222222222221', '2026-01-14 20:35:00+00', TRUE),
(13, 6, '33333333-3333-3333-3333-333333333334', 'PRESENT', '22222222-2222-2222-2222-222222222223', '2026-01-07 19:05:00+00', FALSE),
(14, 6, '33333333-3333-3333-3333-333333333333', 'PRESENT', '22222222-2222-2222-2222-222222222223', '2026-01-07 19:05:00+00', FALSE),
(15, 6, '33333333-3333-3333-3333-333333333332', 'ABSENT', '22222222-2222-2222-2222-222222222223', '2026-01-07 19:05:00+00', FALSE),
(16, 7, '33333333-3333-3333-3333-333333333334', 'PRESENT', '22222222-2222-2222-2222-222222222223', '2026-01-14 19:05:00+00', FALSE),
(17, 7, '33333333-3333-3333-3333-333333333332', 'PRESENT', '22222222-2222-2222-2222-222222222223', '2026-01-14 19:05:00+00', FALSE)
ON CONFLICT
    DO NOTHING;
-- Packages
INSERT INTO package(id, name, description, package_type, price, number_of_classes, validity_days, is_active)
VALUES
    (1, 'Semestr standard', 'Wejścia na cały semestr.', 'SEMESTER', 450.00, 24, 120, TRUE),
(2, 'Karnet 8 wejść', 'Pakiet ważny 60 dni.', 'MULTI_ENTRY', 240.00, 8, 60, TRUE),
(3, 'Wejście jednorazowe', 'Pojedyncze wejście na zajęcia.', 'SINGLE_ENTRY', 40.00, 1, 30, TRUE)
ON CONFLICT
    DO NOTHING;
-- User packages
INSERT INTO user_package(id, user_id, package_id, enrollment_id, purchase_date, activation_date, expiry_date, classes_remaining, status)
VALUES
    (1, '33333333-3333-3333-3333-333333333331', 1, 1, '2026-01-01', '2026-01-03', '2026-04-30', 18, 'ACTIVE'),
(2, '33333333-3333-3333-3333-333333333332', 2, 2, '2026-01-10', '2026-01-10', '2026-02-11', 6, 'ACTIVE'),
(3, '33333333-3333-3333-3333-333333333333', 2, 11, '2026-01-12', '2026-01-12', '2026-02-12', 5, 'ACTIVE'),
(4, '33333333-3333-3333-3333-333333333335', 1, 6, '2026-01-01', '2026-01-03', '2026-04-30', 20, 'ACTIVE'),
(5, '33333333-3333-3333-3333-333333333336', 3, 7, '2026-01-01', '2026-01-01', '2026-01-31', 0, 'USED')
ON CONFLICT
    DO NOTHING;
-- Charges
INSERT INTO charge(id, student_id, due_date, amount_due, type, status, created_by, created_at)
VALUES
    (1, '33333333-3333-3333-3333-333333333331', '2026-01-05', 150.00, 'MONTHLY_FEE', 'PAID', '11111111-1111-1111-1111-111111111111', '2026-01-25 09:00:00+00'),
(2, '33333333-3333-3333-3333-333333333332', '2026-01-05', 150.00, 'MONTHLY_FEE', 'OPEN', '11111111-1111-1111-1111-111111111111', '2026-01-25 09:00:00+00'),
(3, '33333333-3333-3333-3333-333333333335', '2026-01-10', 40.00, 'ADDITIONAL_CLASSES', 'PAID', '11111111-1111-1111-1111-111111111111', '2026-01-01 10:00:00+00')
ON CONFLICT
    DO NOTHING;
-- Payments
INSERT INTO payment(id, user_id, amount, paid_at, payment_method, notes)
VALUES
    (1, '33333333-3333-3333-3333-333333333331', 150.00, '2026-01-03 10:15:00+00', 'TRANSFER', 'Płatność za marzec.'),
(2, '33333333-3333-3333-3333-333333333335', 40.00, '2026-01-06 17:05:00+00', 'CASH', 'Dopłata za dodatkowe wejście.')
ON CONFLICT
    DO NOTHING;
-- Payment allocations
INSERT INTO payment_allocation(payment_id, charge_id, amount_allocated)
VALUES
    (1, 1, 150.00),
(2, 3, 40.00)
ON CONFLICT
    DO NOTHING;
-- Requests
INSERT INTO request(id, type, created_by_user_id, status, payload_json, decision_by, decision_at, decision_note, created_at)
VALUES
    (1, 'GROUP_TRANSFER', '33333333-3333-3333-3333-333333333331', 'PENDING', '{"from_group_id": 1, "to_group_id": 2, "reason": "Zmiana godzin"}', NULL, NULL, NULL, '2026-01-02 08:30:00+00'),
(2, 'ROOM_RENTAL', '33333333-3333-3333-3333-333333333334', 'APPROVED', '{"room_id": 1, "date": "2026-01-22", "start_time": "10:00", "end_time": "12:00"}', '11111111-1111-1111-1111-111111111111', '2026-01-01 12:00:00+00', 'Zatwierdzono wynajem.', '2026-01-28 18:10:00+00')
ON CONFLICT
    DO NOTHING;
-- Room bookings
INSERT INTO room_rental_booking(id, room_id, user_id, booking_date, start_time, end_time, status, purpose, approved_by, approved_at, total_cost)
VALUES
    (1, 1, '33333333-3333-3333-3333-333333333334', '2026-01-22', '10:00', '12:00', 'APPROVED', 'Próba przed występem.', '11111111-1111-1111-1111-111111111111', '2026-01-01 12:05:00+00', 200.00),
(2, 3, '22222222-2222-2222-2222-222222222221', '2026-01-08', '12:00', '14:00', 'COMPLETED', 'Warsztaty salsa.', '11111111-1111-1111-1111-111111111111', '2026-01-20 09:00:00+00', 240.00)
ON CONFLICT
    DO NOTHING;
-- Notifications
INSERT INTO notification(id, type, recipient_user_id, email_to, subject, body, status, scheduled_for, sent_at, error, created_by)
VALUES
    (1, 'PAYMENT_OVERDUE', '33333333-3333-3333-3333-333333333332', 'natalia.kaminska@tiptap.pl', 'Zaległa płatność', '{"student": "Natalia Kamińska", "amount": 150.00, "due_date": "2026-01-05"}', 'PENDING', '2026-01-06 09:00:00+00', NULL, NULL, '11111111-1111-1111-1111-111111111111'),
(2, 'ENROLL_CONFIRM', '33333333-3333-3333-3333-333333333331', 'jan.kowalski@tiptap.pl', 'Potwierdzenie zapisu', '{"class_group": "Salsa podstawy A", "start_date": "2026-01-03"}', 'SENT', NULL, '2026-01-02 08:15:00+00', NULL, '11111111-1111-1111-1111-111111111111')
ON CONFLICT
    DO NOTHING;
-- Audit log
INSERT INTO audit_log(id, user_id, action, entity_type, entity_id, diff_json, created_at)
VALUES
    (1, '11111111-1111-1111-1111-111111111111', 'LOGIN', 'user', '11111111-1111-1111-1111-111111111111', '{"ip": "127.0.0.1"}', '2026-01-01 08:00:00+00'),
(2, '11111111-1111-1111-1111-111111111111', 'CREATE', 'class_group', '1', '{"name": "Salsa podstawy A", "capacity": 18}', '2026-01-01 08:10:00+00'),
(3, '22222222-2222-2222-2222-222222222221', 'UPDATE', 'attendance', '1', '{"status": "PRESENT"}', '2026-01-03 19:45:00+00')
ON CONFLICT
    DO NOTHING;
-- Keep sequences in sync
SELECT
    setval(pg_get_serial_sequence('room', 'id'),(
            SELECT
                MAX(id)
            FROM room));
SELECT
    setval(pg_get_serial_sequence('skill_level', 'id'),(
            SELECT
                MAX(id)
            FROM skill_level));
SELECT
    setval(pg_get_serial_sequence('topic', 'id'),(
            SELECT
                MAX(id)
            FROM topic));
SELECT
    setval(pg_get_serial_sequence('semester', 'id'),(
            SELECT
                MAX(id)
            FROM semester));
SELECT
    setval(pg_get_serial_sequence('class_group', 'id'),(
            SELECT
                MAX(id)
            FROM class_group));
SELECT
    setval(pg_get_serial_sequence('class_session', 'id'),(
            SELECT
                MAX(id)
            FROM class_session));
SELECT
    setval(pg_get_serial_sequence('instructor_substitution', 'id'),(
            SELECT
                MAX(id)
            FROM instructor_substitution));
SELECT
    setval(pg_get_serial_sequence('package', 'id'),(
            SELECT
                MAX(id)
            FROM package));
SELECT
    setval(pg_get_serial_sequence('charge', 'id'),(
            SELECT
                MAX(id)
            FROM charge));
SELECT
    setval(pg_get_serial_sequence('payment', 'id'),(
            SELECT
                MAX(id)
            FROM payment));
SELECT
    setval(pg_get_serial_sequence('request', 'id'),(
            SELECT
                MAX(id)
            FROM request));
SELECT
    setval(pg_get_serial_sequence('room_rental_booking', 'id'),(
            SELECT
                MAX(id)
            FROM room_rental_booking));
SELECT
    setval(pg_get_serial_sequence('enrollment', 'id'),(
            SELECT
                MAX(id)
            FROM enrollment));
SELECT
    setval(pg_get_serial_sequence('attendance', 'id'),(
            SELECT
                MAX(id)
            FROM attendance));
SELECT
    setval(pg_get_serial_sequence('user_package', 'id'),(
            SELECT
                MAX(id)
            FROM user_package));
SELECT
    setval(pg_get_serial_sequence('notification', 'id'),(
            SELECT
                MAX(id)
            FROM notification));
SELECT
    setval(pg_get_serial_sequence('audit_log', 'id'),(
            SELECT
                MAX(id)
            FROM audit_log));
COMMIT;

