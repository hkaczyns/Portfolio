#!/usr/bin/env bash
set -euo pipefail

echo "Applying database migrations..."
alembic upgrade head

echo "Initializing database..."
python -m app.core.init_db

if [ -f "/app/scripts/example_data.sql" ] && [ "${LOAD_EXAMPLE_DATA:-false}" = "true" ]; then
    echo "Loading example data..."
    PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST:-db}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -f /app/scripts/example_data.sql
    echo "Example data loaded successfully!"
else
    echo "Skipping example data load."
fi

echo "Starting FastAPI app..."
exec "$@"
