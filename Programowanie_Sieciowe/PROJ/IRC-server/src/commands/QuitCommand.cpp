#include "../include/commands/QuitCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void QuitCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    std::string quitMessage = "Client Quit";
    if (tokens.size() > 1)
    {
        quitMessage = tokens[1];
    }

    spdlog::info("Client {} sent QUIT: {}", client.getSocket(), quitMessage);

    // Client is removed in server loop
}