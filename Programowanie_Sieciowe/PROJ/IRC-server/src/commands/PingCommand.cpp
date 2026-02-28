#include "../include/commands/PingCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include <spdlog/spdlog.h>

void PingCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() > 1)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " PONG " + std::string(SERVER_NAME) + " :" + tokens[1]);
        spdlog::info("Responded to PING from client {} with PONG", client.getSocket());
    }
}