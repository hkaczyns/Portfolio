FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY .python-version ./
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app
COPY . .
EXPOSE 8000

ENTRYPOINT ["./scripts/prestart.sh"]
CMD ["fastapi", "run", "app/main.py"]
