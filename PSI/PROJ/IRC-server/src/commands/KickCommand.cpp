#include "../include/commands/KickCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include "../include/ChannelManager.hpp"
#include "../include/Channel.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void KickCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() < 3)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 461 " + client.getNick() +
                                         " KICK :Not enough parameters");
        return;
    }

    std::string channelName = tokens[1];
    std::string targetNick = tokens[2];
    std::string reason = (tokens.size() > 3) ? tokens[3] : client.getNick();

    ChannelManager *channelMgr = server->getChannelManager();
    Channel *channel = channelMgr->getChannel(channelName);

    if (!channel)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 403 " + client.getNick() +
                                         " " + channelName + " :No such channel");
        spdlog::info("[KICK] Channel does not exist: {}", channelName);
        return;
    }

    if (!channel->hasMember(client.getSocket()))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 442 " + client.getNick() +
                                         " " + channelName + " :You're not on that channel");
        spdlog::info("[KICK] Client {} is not in channel {}", client.getNick(), channelName);
        return;
    }

    if (!channel->isOperator(client.getSocket()))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 482 " + client.getNick() +
                                         " " + channelName + " :You're not channel operator");
        spdlog::info("[KICK] Client {} is not channel operator in {}", client.getNick(), channelName);
        return;
    }

    Client *targetClient = server->getClientByNick(targetNick);
    if (!targetClient)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 401 " + client.getNick() +
                                         " " + targetNick + " :No such nick/channel");
        spdlog::info("[KICK] User does not exist: {}", targetNick);
        return;
    }

    if (!channel->hasMember(targetClient->getSocket()))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 441 " + client.getNick() +
                                         " " + targetNick + " " + channelName + " :They aren't on that channel");
        spdlog::info("[KICK] {} is not in channel {}", targetNick, channelName);
        return;
    }

    spdlog::info("[KICK] {} is kicking {} from {} - reason: {}", client.getNick(), targetNick, channelName, reason);

    // Send KICK to all channel members (incl the kicked user)
    const auto &members = channel->getMembers();
    std::string kickMessage = ":" + client.getNick() + "!" + client.getUsername() +
                              "@localhost KICK " + channelName + " " + targetNick + " :" + reason;

    for (int memberSocket : members)
    {
        auto it = server->getAllClients().find(memberSocket);
        if (it != server->getAllClients().end())
        {
            Client *member = it->second.get();
            server->sendToClient(*member, kickMessage);
        }
    }

    if (!channelMgr->kickFromChannel(channelName, client.getSocket(), targetClient->getSocket()))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 482 " + client.getNick() +
                                         " " + channelName + " :Cannot kick user");
        return;
    }

    targetClient->leaveChannel(channelName);
}