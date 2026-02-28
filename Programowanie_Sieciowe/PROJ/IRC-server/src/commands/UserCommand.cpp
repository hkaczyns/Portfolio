#include "../include/commands/UserCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include <iostream>
#include <spdlog/spdlog.h>
#include "../include/MessageParser.hpp"

void UserCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() < 5)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 461 * USER :Not enough parameters");
        spdlog::debug("Client {} did not provide enough parameters in USER command", client.getSocket());
        return;
    }

    if (client.isRegistered())
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 462 " + client.getNick() + " :You may not reregister");
        spdlog::debug("Client {} attempted to reregister with USER command", client.getSocket());
        return;
    }

    if(tokens[1].empty() || tokens[4].empty())
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 461 * USER :Not enough parameters");
        spdlog::debug("Client {} provided empty username or realname in USER command", client.getSocket());
        return;
    }
    if(!MessageParser::isValidNick(tokens[1]))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 462 * USER :Invalid username");
        spdlog::debug("Client {} provided invalid username in USER command", client.getSocket());
        return;
    }
    if(server->checkUsernameAvailability(tokens[1], &client) == false)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 462 * " + tokens[1] + " :Username is already in use");
        spdlog::debug("Client {} attempted to use an already taken username in USER command", client.getSocket());
        return;
    }

    client.setUsername(tokens[1]);
    client.setRealname(tokens[4]);

    spdlog::info("Socket {} set username to: {}", client.getSocket(), tokens[1]);
    spdlog::info("Socket {} set realname to: {}", client.getSocket(), tokens[4]);

    server->checkClientRegistration(client);
}