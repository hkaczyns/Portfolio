@echo off

echo Starting database in Docker...
docker compose up -d

echo Waiting for database to initialize...
echo (It should take about a minute if it is the first time you are running HabemusRex)
:wait_loop
timeout /T 3 >nul
docker exec mysql_container mysql -u root -p1234 -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo Database is not ready yet. Retrying...
    goto wait_loop
)

echo Database is ready.

echo Starting JavaFX application...
timeout /T 5 >nul
java -jar target/HabemusRex-1.0-SNAPSHOT.jar

