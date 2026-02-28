#include "../include/commands/CommandHandler.hpp"
#include "../include/commands/Command.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include <iostream>
#include <algorithm>
#include <spdlog/spdlog.h>

CommandHandler::CommandHandler()
{
}

void CommandHandler::registerCommand(std::unique_ptr<Command> command)
{
    std::string name = command->getName();
    std::transform(name.begin(), name.end(), name.begin(), ::toupper); // Convert to uppercase
    commands_[name] = std::move(command);
}

void CommandHandler::handleCommand(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.empty())
    {
        return;
    }

    std::string commandName = tokens[0];
    std::transform(commandName.begin(), commandName.end(), commandName.begin(), ::toupper); // Convert to uppercase

    auto it = commands_.find(commandName);
    if (it != commands_.end())
    {
        Command *command = it->second.get();

        if (command->requiresRegistration() && !client.isRegistered())
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 451 * :ERR_NOTREGISTERED");
            return;
        }
        if (command->requiresPassword() && !client.isAuthenticated())
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 464 * :ERR_PASSWDMISMATCH");
            return;
        }
        command->execute(client, tokens, server);
    }
    else
    {
        spdlog::trace("Client {} sent unsupported command: {}", client.getSocket(), commandName);
        if (client.isRegistered())
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 421 " + client.getNick() + " " + commandName + " :Unknown command");
        }
    }
}