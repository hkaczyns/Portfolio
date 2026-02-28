#include "../include/commands/PassCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void PassCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() >= 2)
    {
        spdlog::trace("PASS message received", client.getSocket());
        int compare_result = tokens[1].compare(std::string(SERVER_PASSWORD));
        spdlog::trace("PASS compare result: {}, compared {} to {}", compare_result, tokens[1], std::string(SERVER_PASSWORD));
        if (compare_result != 0)
        {
            spdlog::info("Client {} provided incorrect password in PASS command", client.getSocket());
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 464 * ERR_PASSWDMISMATCH");
            client.setCapNegotiation(true);
        }
        if (client.isAuthenticated())
        {
            spdlog::info("Client {} is already authenticated", client.getSocket());
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 462 * ERR_ALREADYREGISTRED");
            return;
        }
        client.setAuthenticated(true);
        spdlog::trace("Client {} authenticated successfully with PASS command", client.getSocket());
    }
    else
    {
        spdlog::info("Client {} did not provide a password in PASS command", client.getSocket());
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 461 * ERR_NEEDMOREPARAMS");
    }
}
