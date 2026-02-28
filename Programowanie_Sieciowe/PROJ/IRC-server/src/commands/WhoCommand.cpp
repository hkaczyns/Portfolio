#include "../include/commands/WhoCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include <spdlog/spdlog.h>
#include <fnmatch.h>

void WhoCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    std::string mask;
    if (tokens.size() >= 2)
        mask = tokens[1];

    const bool listAll = mask.empty() || mask == "0";
    const auto &clients = server->getAllClients();

    for (const auto &[socket, otherClient] : clients)
    {
        if (!otherClient || !otherClient->isRegistered())
            continue;

        bool anyMatches = false;
        if (listAll)
        {
            anyMatches = true;
        }
        else
        {
            const std::string nick = otherClient->getNick();
            const std::string username = otherClient->getUsername();
            const std::string realname = otherClient->getRealname();

            if (fnmatch(mask.c_str(), nick.c_str(), 0) == 0 ||
                fnmatch(mask.c_str(), username.c_str(), 0) == 0 ||
                fnmatch(mask.c_str(), realname.c_str(), 0) == 0)
            {
                anyMatches = true;
            }
        }

        if (!anyMatches)
            continue;

        server->sendToClient(client,
                             ":" + std::string(SERVER_NAME) + " 352 " + client.getNick() + " * " +
                                 otherClient->getUsername() + " localhost " + std::string(SERVER_NAME) + " " +
                                 otherClient->getNick() + " H :0 " +
                                 otherClient->getRealname());
        spdlog::info("Sent WHO entry for client {} to client {}", otherClient->getSocket(), client.getSocket());
    }

    server->sendToClient(
        client, ":" + std::string(SERVER_NAME) + " 315 " + client.getNick() + " " + (mask.empty() ? "*" : mask) + " :End of WHO list");

    spdlog::info("Sent WHO list to client {}", client.getSocket());
}