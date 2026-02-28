#!/bin/bash

echo "Starting database in Docker..."
sudo docker compose up -d

echo "Waiting for database to initialize..."
echo "(It should take about a minute if it is the first time you are running HabemusRex)"

while ! sudo docker exec mysql_container mysql -u root -p1234 -e "SELECT 1" &>/dev/null; do
    echo "Database is not ready yet. Retrying in 3 seconds..."
    sleep 3
done

echo "Database is ready."

echo "Starting JavaFX application..."
sleep 5
java -jar target/HabemusRex-1.0-SNAPSHOT.jar
