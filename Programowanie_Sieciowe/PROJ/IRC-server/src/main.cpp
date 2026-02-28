#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include "../include/Logger.hpp"
#include <iostream>
#include <spdlog/spdlog.h>
#include <csignal>

Server *g_server = nullptr;

void signalHandler(int signum)
{
    spdlog::info("Received signal {}", signum);
    if (g_server)
    {
        g_server->stop();
    }
}

int main(int argc, char *argv[])
{
    int port = DEFAULT_PORT;

    if (argc > 1)
    {
        port = std::atoi(argv[1]);
        if (port <= 0 || port > 65535)
        {
            spdlog::error("Invalid port number provided: {}", argv[1]);
            spdlog::error("Usage: {} [port]", argv[0]);
            return 1;
        }
    }

    // Install signal handlers
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);

    // Ignore SIGPIPE
    std::signal(SIGPIPE, SIG_IGN);

    logger::init("app.log");
    spdlog::info("IRC server started");

    Server server(port);
    g_server = &server;

    server.run();

    g_server = nullptr;

    spdlog::info("Server has shut down");
    logger::shutdown();
    return 0;
}
