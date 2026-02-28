#include "../include/commands/CapCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void CapCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() >= 2 && tokens[1] == "LS")
    {
        spdlog::info("Client {} is asking about server capabilities", client.getSocket());
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " CAP * LS :");
        client.setCapNegotiation(true);
    }
    else if (tokens.size() >= 2 && tokens[1] == "END")
    {
        spdlog::info("Client {} has ended capability negotiation", client.getSocket());
        client.setCapNegotiation(false);
        server->checkClientRegistration(client);
    }
}