# **4. Setting up the database**

This section provides instructions on how to set up a dockerized PostgreSQL database for local development of the TipTap backend application.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/) - for containerized database deployment.

## Running a dockerized PostgreSQL Database

As you can see, the root directory contains three docker-compose files: `docker-compose.yml`, `docker-compose.dev.yml`, and `docker-compose.test.yml`. As you might have guessed, the `docker-compose.dev.yml` file is used to set up the development environment, which includes a PostgreSQL database instance for local development. To start the database for development, follow these steps:

1. Make sure you are in the root directory of the project.
2. Run the following command to start the PostgreSQL database using Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up -d db
```

This command will start the PostgreSQL database container in detached mode. 3. The database will be accessible at `localhost:5432` with the following default credentials:

- **Username**: `tiptap_user`
- **Password**: `tiptap_password`
- **Database Name**: `tiptap_db`

4. You can verify that the database container is running by executing:

```bash
docker ps
```

You should see a container named something like `dev_tiptap_db` in the list.

## Stopping the Database

When you are done with your development session and want to stop the database container, you can run the following command:

```bash
docker compose -f docker-compose.dev.yml down
```

This command will stop and remove the database container.

## Connecting the Backend to the Database

If you now try to run the backend using the command:

```bash
uv run fastapi dev
```

The backend should be able to connect to the PostgreSQL database running in the Docker container. Make sure that the environment variables in your `server/.env.dev` file are set correctly to match the database connection settings.

## Pro Tip: VSCode Docker Extension

If you are using Visual Studio Code as your code editor, consider installing the [Docker extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker). This extension provides a user-friendly interface to manage your Docker containers directly from VSCode. You can start docker containers just by opening the docker-compose file you wish to manage and clicking `Run all services`!

## Viewing the database with Datagrip

To view and manage the PostgreSQL database, you can use a database management tool like [Datagrip](https://www.jetbrains.com/datagrip/). Here are the steps to connect Datagrip to your dockerized PostgreSQL database:

1. Open Datagrip and click on `New` (a plus icon in the top left corner).
2. Select `Data Source > PostgreSQL` from the list of database types.
3. In the `Data Sources and Drivers` dialog, enter the connection details according to your `.env.dev` file. You'll probably want something like this:

- **Name**: (whatever you want to name this connection in Datagrip)
- **Host**: `DB_SERVER` from your `server/.env.dev` file (probably `localhost` or `127.0.0.1`)
- **Port**: `DB_PORT` from your `server/.env.dev` file (probably `5432`)
- **Authentication**: User & Password
- **User**: `DB_USER` from your `server/.env.dev` file
- **Password**: `DB_PASSWORD` from your `server/.env.dev` file
- **Database**: `DB_NAME` from your `server/.env.dev` file

4. Click on the `Test Connection` button to ensure that Datagrip can connect to the database. If the connection is successful, click `OK` to save the data source.
5. You should now see the new data source in the Database tool window. You can expand it to view the database schema, tables, and other objects.
6. You can now run SQL queries, manage tables, and perform other database operations directly from Datagrip!
