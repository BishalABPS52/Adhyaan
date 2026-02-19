-- Placeholder for study room queries (for future use)

-- name: get_study_room_by_id
SELECT * FROM study_rooms WHERE id = %s;

-- name: get_study_room_by_code
SELECT * FROM study_rooms WHERE join_code = %s;

-- name: create_study_room
INSERT INTO study_rooms (name, description, creator_id, join_code)
VALUES (%s, %s, %s, %s)
RETURNING *;
