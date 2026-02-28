#include "../include/commands/PartCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include "../include/ChannelManager.hpp"
#include "../include/Channel.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void PartCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() < 2)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 461 " + client.getNick() +
                                         " PART :Not enough parameters");
        return;
    }

    std::string channelName = tokens[1];
    std::string reason = (tokens.size() > 2) ? tokens[2] : client.getNick();

    ChannelManager *channelMgr = server->getChannelManager();
    Channel *channel = channelMgr->getChannel(channelName);

    if (!channel)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 403 " + client.getNick() +
                                         " " + channelName + " :No such channel");
        spdlog::info("[PART] Channel does not exist: {}", channelName);
        return;
    }

    if (!channel->hasMember(client.getSocket()))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 442 " + client.getNick() +
                                         " " + channelName + " :You're not on that channel");
        spdlog::info("[PART] Client {} is not in channel {}", client.getSocket(), channelName);
        return;
    }

    spdlog::info("[PART] Client {} is leaving channel {} - reason: {}", client.getNick(), channelName, reason);

    // Send PART message to all channel members
    const auto &members = channel->getMembers();
    std::string partMessage = ":" + client.getNick() + "!" + client.getUsername() +
                              "@localhost PART " + channelName + " :" + reason;

    for (int memberSocket : members)
    {
        auto it = server->getAllClients().find(memberSocket);
        if (it != server->getAllClients().end())
        {
            Client *member = it->second.get();
            server->sendToClient(*member, partMessage);
        }
    }

    channelMgr->leaveChannel(channelName, client.getSocket());
    client.leaveChannel(channelName);
}