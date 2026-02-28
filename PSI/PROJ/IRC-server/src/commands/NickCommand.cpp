#include "../include/commands/NickCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include "../include/MessageParser.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void NickCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() < 2)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 431 * :No nickname given");
        spdlog::trace("Client {} did not provide a nickname in NICK command", client.getSocket());
        return;
    }

    std::string newNick = tokens[1];

    if (!MessageParser::isValidNick(newNick))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 432 * " + newNick + " :Nickname is invalid");
        return;
    }

    if (server->isNickInUse(newNick, &client))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 433 * " + newNick + " :Nickname is already in use");
        spdlog::trace("Client {} tried to use an already taken nick: {}", client.getSocket(), newNick);
        return;
    }

    client.setNick(newNick);
    spdlog::info("Socket {} nick set to: {}", client.getSocket(), newNick);

    server->checkClientRegistration(client);
}