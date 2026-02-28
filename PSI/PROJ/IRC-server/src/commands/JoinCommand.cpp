#include "../include/commands/JoinCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include "../include/MessageParser.hpp"
#include "../include/ChannelManager.hpp"
#include "../include/Channel.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void JoinCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() < 2)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 461 " + client.getNick() +
                                         " JOIN :Not enough parameters");
        return;
    }

    std::string channelName = tokens[1];

    if (!MessageParser::isValidChannel(channelName))
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 403 " + client.getNick() +
                                         " " + channelName + " :No such channel");
        std::cout << "[JOIN] Invalid channel name: " << channelName << std::endl;
        return;
    }

    ChannelManager *channelMgr = server->getChannelManager();
    Channel *channel = channelMgr->getChannel(channelName);
    bool isNewChannel = (channel == nullptr);

    if (isNewChannel)
    {
        channel = channelMgr->createChannel(channelName, client.getSocket());
        if (!channel)
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 403 " + client.getNick() +
                                             " " + channelName + " :Cannot create channel");
            return;
        }

        spdlog::info("Client {} created and joined new channel {} (socket {})", client.getNick(), channelName, client.getSocket());
    }
    else
    {
        // Join existing channel
        if (channel->hasMember(client.getSocket()))
        {
            spdlog::info("Client {} attempted to re-join channel {}", client.getSocket(), channelName);
            return;
        }

        if (!channelMgr->joinChannel(channelName, client.getSocket()))
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 403 " + client.getNick() +
                                             " " + channelName + " :Cannot join channel");
            return;
        }

        spdlog::info("Client {} joined existing channel {} (socket {})", client.getNick(), channelName, client.getSocket());
    }

    client.joinChannel(channelName);

    server->sendToClient(client, ":" + client.getNick() + "!" + client.getUsername() +
                                     "@localhost JOIN :" + channelName);

    const auto &members = channel->getMembers();
    for (int memberSocket : members)
    {
        if (memberSocket != client.getSocket())
        {
            auto it = server->getAllClients().find(memberSocket);
            if (it != server->getAllClients().end())
            {
                Client *member = it->second.get();
                server->sendToClient(*member, ":" + client.getNick() + "!" + client.getUsername() +
                                                  "@localhost JOIN :" + channelName);
            }
        }
    }

    if (!channel->getTopic().empty())
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 332 " + client.getNick() +
                                         " " + channelName + " :" + channel->getTopic());
    }
    else
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 331 " + client.getNick() +
                                         " " + channelName + " :No topic is set");
    }

    std::string namesList;
    for (int memberSocket : members)
    {
        auto it = server->getAllClients().find(memberSocket);
        if (it != server->getAllClients().end())
        {
            Client *member = it->second.get();
            if (channel->isOperator(memberSocket))
            {
                namesList += "@";
            }
            namesList += member->getNick() + " ";
        }
    }

    server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 353 " + client.getNick() +
                                     " = " + channelName + " :" + namesList);

    server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 366 " + client.getNick() +
                                     " " + channelName + " :End of NAMES list");
}