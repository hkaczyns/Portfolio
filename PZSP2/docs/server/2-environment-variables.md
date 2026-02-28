# **2. Environment Variables**

This section provides an overview of the environment variables used in the TipTap backend application. Proper configuration of these variables is essential for the application to function correctly.

## What are Environment Variables?

Environment variables are key-value pairs that are used to configure application settings without hardcoding them into the source code. They allow for greater flexibility and security, especially when dealing with sensitive information such as database credentials.

## Configuration Files

The TipTap backend in development uses two main configuration files for environment variables:

- `.env`: This file contains environment variables for local development.
- `server/.env.dev`: This file is specifically for backend development settings.

In production, instead of `.env.dev`, the application would use `server/.env.prod` for production-specific settings.

## Key Environment Variables

Here are some of the key environment variables used in the TipTap backend:

- `PROJECT_NAME`: The name of the project.
- `APP_ENV`: The application environment (e.g., development, production, test).
- `DEBUG`: A boolean indicating whether debug mode is enabled.
- `API_V1_STR`: The base path for the API version 1.
- `DB_SERVER`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database connection settings.
- `RESET_PASSWORD_SECRET`, `VERIFICATION_TOKEN_SECRET`: Secrets used for authentication and token generation.
- `COOKIE_NAME`, `COOKIE_MAX_AGE`, `COOKIE_SECURE`, `COOKIE_SAMESITE`: Cookie settings for session management.
- `FIRST_SUPERUSER_EMAIL`, `FIRST_SUPERUSER_PASSWORD`: Credentials for the initial superuser account.
- `SEND_EMAILS`, `SMTP_TLS`, `SMTP_SSL`, `SMTP_PORT`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAILS_FROM_EMAIL`, `EMAILS_FROM_NAME`: Email configuration settings.
- `ALLOWED_ORIGINS`: A list of allowed origins for CORS.

## Setting Up Environment Variables

To set up the environment variables for local development, follow these steps:

1. Copy the `.env.example` file in the root directory to create a new `.env` file.
2. Copy the `server/.env.example` file to create a new `server/.env.dev` file.
3. Edit the newly created `.env` and `server/.env.dev` files to set the appropriate values for your development environment.

## Security Considerations

Ensure that sensitive information such as database passwords and secret keys are not committed to version control. Use environment variables to manage these securely. To make sure that sensitive files are not tracked by Git, check the `.gitignore` file in the project root.
