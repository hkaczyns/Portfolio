# **3. Working with `uv`**

To run the backend in development mode, you will need to set up a Python environment and install the necessary dependencies. This guide will walk you through the steps to get the backend up and running!

## What is `uv`?

[`uv`](https://docs.astral.sh/uv/) is a Python package for managing Python environments and packages. It simplifies the process of setting up and maintaining development environments.

## How to set up and run the backend with `uv`

### Step 1: Installing `uv`

There are a few ways to install `uv`. If you are on Linux or macOS, you can use the following command:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

If you prefer to use `pip`, you can install `uv` with the following command:

```bash
pip install uv
```

After installing `uv`, you can verify the installation by running:

```bash
uv
```

This should display the `uv` help menu.

### Step 2: Sync the environment

Next, you should sync the development environment using `uv`. This will create a virtual environment and install all the necessary dependencies for the project. First, if you are still in the repository root, navigate to the `server` directory:

```bash
cd server
```

Then, run the following command to sync the environment:

```bash
uv sync
```

This command will read the `uv` configuration file and install all the required packages in a virtual environment.

### Step 3: Run the application

Once the environment is synced, you can run the application using `uv`. Use the following command:

```bash
uv run fastapi dev
```

This will start the FastAPI development server. But what's that? You probably see the error indicating that the backend cannot connect to the database. That's because you need to have a running database instance for the backend to connect to! Follow the instructions in the [Setting up the database](4-setting-up-database.md) section to get a local database up and running.

### Step 4: Activating the virtual environment

In the later stages of development, you might want to activate the virtual environment created by `uv` to run other commands or scripts within that environment. You can activate the virtual environment, by first navigating to the `server` directory:

```bash
cd server
```

Then, activate the virtual environment with the following command:

```bash
source .venv/bin/activate
```

This will switch your shell to use the virtual environment, allowing you to run Python commands and scripts with the dependencies installed in that environment. You can see that your shell prompt has changed and now shows `(server)` at the beginning - indicating that the virtual environment is active!
