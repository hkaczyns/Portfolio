#include "../include/commands/PrivmsgCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include "../include/ChannelManager.hpp"
#include "../include/Channel.hpp"
#include <iostream>
#include <spdlog/spdlog.h>

void PrivmsgCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() < 2)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 411 " + client.getNick() +
                                         " :No recipient given (PRIVMSG)");
        spdlog::warn("PRIVMSG command from client {} missing recipient", client.getSocket());
        return;
    }

    if (tokens.size() < 3)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 412 " + client.getNick() +
                                         " :No text to send");
        spdlog::warn("PRIVMSG command from client {} missing message text", client.getSocket());
        return;
    }

    if (tokens.size() > 3)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 407 " + client.getNick() +
                                         " :Too many targets");
        spdlog::warn("PRIVMSG command from client {} has too many targets", client.getSocket());
        return;
    }

    std::string receiver = tokens[1];
    std::string message = tokens[2];

    spdlog::trace("PRIVMSG command from client {} to {}: {}", client.getSocket(), receiver, message);

    // Check if the receiver is a channel
    if (receiver[0] == '#' || receiver[0] == '&')
    {
        ChannelManager *channelMgr = server->getChannelManager();
        Channel *channel = channelMgr->getChannel(receiver);

        if (!channel)
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 403 " + client.getNick() +
                                             " " + receiver + " :No such channel");
            ;
            spdlog::warn("PRIVMSG command from client {}: no such channel {}", client.getSocket(), receiver);
            return;
        }

        // Check if sender is in the channel
        if (!channel->hasMember(client.getSocket()))
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 404 " + client.getNick() +
                                             " " + receiver + " :Cannot send to channel");
            spdlog::warn("PRIVMSG command from client {}: not in channel {}", client.getSocket(), receiver);
            return;
        }

        // Send message to all channel members (except the sender)
        std::string formattedMessage = ":" + client.getNick() + "!" +
                                       client.getUsername() + "@localhost PRIVMSG " +
                                       receiver + " :" + message;

        const auto &members = channel->getMembers();
        int sentCount = 0;
        for (int memberSocket : members)
        {
            if (memberSocket != client.getSocket())
            {
                auto it = server->getAllClients().find(memberSocket);
                if (it != server->getAllClients().end())
                {
                    Client *member = it->second.get();
                    server->sendToClient(*member, formattedMessage);
                    sentCount++;
                }
            }
        }
        spdlog::info("Delivered PRIVMSG from client {} to channel {} ({} members)", client.getSocket(), receiver, sentCount);
        return;
    }

    // Private message to a user
    Client *targetClient = server->getClientByNick(receiver);

    if (!targetClient)
    {
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 401 " + client.getNick() +
                                         " " + receiver + " :No such nick/channel");
        spdlog::warn("PRIVMSG command from client {}: no such nick {}", client.getSocket(), receiver);
        return;
    }

    std::string formattedMessage = ":" + client.getNick() + "!" +
                                   client.getUsername() + "@localhost PRIVMSG " +
                                   receiver + " :" + message;

    server->sendToClient(*targetClient, formattedMessage);
    spdlog::info("Delivered PRIVMSG from client {} to {}", client.getSocket(), receiver);
}