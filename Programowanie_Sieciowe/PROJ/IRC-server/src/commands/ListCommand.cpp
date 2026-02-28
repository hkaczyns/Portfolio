#include "../include/commands/ListCommand.hpp"
#include "../include/Client.hpp"
#include "../include/Server.hpp"
#include "../include/Config.hpp"
#include "../include/ChannelManager.hpp"
#include "../include/Channel.hpp"
#include <spdlog/spdlog.h>

void ListCommand::execute(Client &client, const std::vector<std::string> &tokens, Server *server)
{
    if (tokens.size() == 1)
    {
        const auto &channels = server->getChannelManager()->getAllChannels();
        if (channels.empty())
        {
            server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 323 " + client.getNick() + " :End of /LIST");
            return;
        }

        for (const auto &channelPair : channels)
        {
            const auto &channel = channelPair.second;
            size_t memberCount = channel->getMemberCount();
            if (!channel->getTopic().empty())
            {
                server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 322 " + client.getNick() + " " + channel->getName() + " " + std::to_string(memberCount) + " :" + channel->getTopic());
                continue;
            }
            else
            {
                server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 322 " + client.getNick() + " " + channel->getName() + " " + std::to_string(memberCount) + " :No topic");
            }
        }
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 323 " + client.getNick() + " :End of /LIST");
    }
    else
    {
        for (size_t i = 1; i < tokens.size(); ++i)
        {
            const std::string &channelName = tokens[i];
            Channel *channel = server->getChannelManager()->getChannel(channelName);
            if (channel)
            {
                size_t memberCount = channel->getMemberCount();
                if (!channel->getTopic().empty())
                {
                    server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 322 " + client.getNick() + " " + channel->getName() + " " + std::to_string(memberCount) + " :" + channel->getTopic());
                    continue;
                }
                else
                {
                    server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 322 " + client.getNick() + " " + channel->getName() + " " + std::to_string(memberCount) + " :No topic");
                }
            }
        }
        server->sendToClient(client, ":" + std::string(SERVER_NAME) + " 323 " + client.getNick() + " :End of /LIST");
    }
}