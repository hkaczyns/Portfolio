from collections.abc import AsyncGenerator
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
import pytest_asyncio
from sqlalchemy.pool import NullPool
from app.main import app
from app.models.base import Base
from app.core.config import get_settings
from app.core.init_db import init_db
from app.core import db as core_db
from app.core.db import get_async_session


settings = get_settings()


@pytest_asyncio.fixture
async def db_engine() -> AsyncGenerator:
    engine = create_async_engine(
        str(settings.DATABASE_URI), poolclass=NullPool
    )
    async with engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE"))
        await conn.execute(text("CREATE SCHEMA public"))
        await conn.run_sync(Base.metadata.create_all)
    try:
        yield engine
    finally:
        await engine.dispose()


@pytest_asyncio.fixture
async def db_sessionmaker(db_engine):
    return async_sessionmaker(
        db_engine, expire_on_commit=False, autoflush=False, autocommit=False
    )


@pytest_asyncio.fixture(autouse=True)
async def init_superuser(db_sessionmaker):
    original_session_maker = core_db.async_session_maker
    core_db.async_session_maker = db_sessionmaker
    try:
        await init_db()
        yield
    finally:
        core_db.async_session_maker = original_session_maker


@pytest_asyncio.fixture
async def client(db_sessionmaker):
    async def override_get_async_session() -> (
        AsyncGenerator[AsyncSession, None]
    ):
        async_session_maker = db_sessionmaker
        async with async_session_maker() as session:
            yield session

    app.dependency_overrides[get_async_session] = override_get_async_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
        follow_redirects=False,
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
