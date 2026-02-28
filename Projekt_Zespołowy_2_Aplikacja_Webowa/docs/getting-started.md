# **TipTap - Getting Started**

Welcome to the TipTap project! This documentation will guide you through the steps to get the application up and running in your local development environment.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/) - for containerized application deployment.
- [Git](https://git-scm.com/) - for cloning the repository.

We recommend running the application in a Linux-based environment for the best compatibility. If you are using Windows, consider using WSL2 (Windows Subsystem for Linux) or a virtual machine.

## Cloning the Repository

To get started, clone the TipTap repository from GitHub:

```bash
git clone https://github.com/maciejb7/PZSP2-TipTap
```

Navigate to the project directory:

```bash
cd PZSP2-TipTap
```

## Running the Application

There are three ways to run the TipTap application - essentially three different environments:

1. **Production Environment** - If you want to run the app as you would on a production server. You just enter one command and - voila! Everything is prepared behind the scenes and the app is up and running.
2. **Development Environment** - If you are a developer and want to work on the project. This method requires some initial setup but allows you to make changes to the code and see them reflected in real-time.
3. **Testing Environment** - If you want to run the backend tests to ensure everything is functioning correctly. This method is useful for developers who want to verify the integrity of the backend code.

### Production Environment

To run the application in a production-like environment using Docker, first, fill in the necessary environment variables in the `.env` and `server/.env.prod` files. Then, execute the following command:

```bash
docker compose up
```

The application will be accessible at `http://localhost:5173`.

### Development Environment

For development purposes, you run frontend and backend services separately - depending on what you want to work on. If you want to make changes to the frontend, navigate to the `client` directory of the `docs`. For backend changes, navigate to the `server` directory.

### Testing Environment

Running backend tests is described in the `server` part of the docs. Follow the instructions there to set up and run the tests.
