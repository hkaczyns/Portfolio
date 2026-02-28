# **5. Alembic Migrations**

Alembic is a lightweight database migration tool for usage with SQLAlchemy. It allows you to manage changes to your database schema over time in a consistent and organized manner.

## What is SQLAlchemy?

SQLAlchemy is a popular SQL toolkit and Object-Relational Mapping (ORM) library for Python. It provides a set of high-level API for connecting to relational databases and performing database operations using Python objects.

## What is Alembic?

Alembic is a database migration tool that works with SQLAlchemy. It allows you to create and manage database schema changes in a version-controlled manner. With Alembic, you can create migration scripts that define the changes to be made to the database schema, and then apply those changes to the database.

## Setting up Alembic

If you have followed the previous sections, you should already have Alembic installed and configured in your project. You can check whether Alembic is installed by running the following command in your terminal (make sure you have activated your virtual environment!):

```bash
alembic --version
```

If Alembic is installed, you should see the version number printed in the terminal.

## Working with Alembic

We have already started our dockerized PostgreSQL database in the previous sections. The problem is, our database is completely empty. We need to create the necessary tables and schema for our application to work properly. This is where Alembic comes in.

As the project has been developed, the database schema has changed multiple times. Alembic helps us manage these changes by allowing us to create migration scripts that define the changes to be made to the database schema.

You can find the Alembic migration scripts in the `server/alembic/versions` directory. Each migration script is named with a unique identifier and a brief description of the changes made in that migration.

We can apply all the migrations to our database by running the following command in the terminal:

```bash
alembic upgrade head
```

This command will apply all the migration scripts in the `server/alembic/versions` directory to the database, in the chronological order they were created, creating the necessary tables and schema for our application to work properly.

After running the above command, our database should now have the necessary tables and schema for our application to work properly. You can verify this by connecting to the PostgreSQL database (using Datagrip or pgAdmin) and checking the tables that have been created.

## Creating New Migrations

As we continue to develop our application, we may need to make changes to the database schema. When we make changes to the database schema, we need to create a new migration script that defines the changes to be made.

Let's say we want to add a new column to an existing table - for example, adding a `last_login` column to the `users` table. We can go to the `server/app/models/user.py` file and add the new column to the `User` model:

```python
class User(SQLAlchemyBaseUserTableUUID, Base):
    first_name: Mapped[str] = mapped_column(String(64), nullable=False)
    last_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
```

After making the changes to the model, we can create a new migration script by running the following command in the terminal:

```bash
alembic revision --autogenerate -m "Add last_login column to users table"
```

This command will create a new migration script in the `server/alembic/versions` directory, with the changes to be made to the database schema automatically generated based on the changes made to the models.
We can then apply the new migration to the database by running the following command:

```bash
alembic upgrade head
```

This command will apply the new migration script to the database, adding the `last_login` column to the `users` table - you can see the changes if you refresh the database schema in your database management tool. Congratulations! You have successfully created and applied a new migration using Alembic.
