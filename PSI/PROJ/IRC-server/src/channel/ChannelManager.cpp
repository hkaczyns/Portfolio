#include "../include/ChannelManager.hpp"
#include "../include/Channel.hpp"
#include <algorithm>
#include <iostream>
#include <spdlog/spdlog.h>

Channel *ChannelManager::createChannel(const std::string &name, int creatorSocket)
{
    if (channelExists(name))
    {
        return nullptr;
    }

    auto channel = std::make_unique<Channel>(name);
    channel->addMember(creatorSocket);
    channel->addOperator(creatorSocket); // Creator is the operator

    Channel *ptr = channel.get();
    channels_[name] = std::move(channel);

    spdlog::info("Created channel: {}, operator socket: {}", name, creatorSocket);

    return ptr;
}

Channel *ChannelManager::getChannel(const std::string &name)
{
    auto it = channels_.find(name);
    if (it != channels_.end())
    {
        return it->second.get();
    }
    return nullptr;
}

bool ChannelManager::channelExists(const std::string &name) const
{
    return channels_.find(name) != channels_.end();
}

void ChannelManager::removeChannel(const std::string &name)
{
    auto it = channels_.find(name);
    if (it != channels_.end())
    {
        spdlog::info("Removing channel: {}", name);
        channels_.erase(it);
    }
}

bool ChannelManager::joinChannel(const std::string &channelName, int clientSocket)
{
    Channel *channel = getChannel(channelName);
    if (!channel)
    {
        return false;
    }

    if (channel->hasMember(clientSocket))
    {
        return false;
    }

    channel->addMember(clientSocket);
    spdlog::info("Socket {} joined channel {}", clientSocket, channelName);
    return true;
}

void ChannelManager::leaveChannel(const std::string &channelName, int clientSocket)
{
    Channel *channel = getChannel(channelName);
    if (!channel)
    {
        return;
    }

    channel->removeMember(clientSocket);
    spdlog::info("Socket {} left channel {}", clientSocket, channelName);

    // If the channel is empty, remove it
    if (channel->getMemberCount() == 0)
    {
        removeChannel(channelName);
    }
}

void ChannelManager::leaveAllChannels(int clientSocket)
{
    for (const auto &[name, channel] : channels_)
    {
        if (channel->hasMember(clientSocket))
        {
            leaveChannel(name, clientSocket);
        }
    }
}

bool ChannelManager::kickFromChannel(const std::string &channelName, int operatorSocket, int targetSocket)
{
    Channel *channel = getChannel(channelName);
    if (!channel)
    {
        return false;
    }

    if (!channel->isOperator(operatorSocket))
    {
        return false;
    }

    if (!channel->hasMember(targetSocket))
    {
        return false;
    }

    channel->removeMember(targetSocket);
    spdlog::info("Socket {} kicked socket {} from channel {}", operatorSocket, targetSocket, channelName);

    // If the channel is empty, remove it
    if (channel->getMemberCount() == 0)
    {
        removeChannel(channelName);
    }

    return true;
}

std::vector<std::string> ChannelManager::getChannelList() const
{
    std::vector<std::string> list;
    for (const auto &[name, channel] : channels_)
    {
        list.push_back(name);
    }
    return list;
}

std::vector<int> ChannelManager::getChannelMembers(const std::string &channelName) const
{
    auto it = channels_.find(channelName);
    if (it == channels_.end())
    {
        return {};
    }

    const auto &members = it->second->getMembers();
    return std::vector<int>(members.begin(), members.end());
}

const std::map<std::string, std::unique_ptr<Channel>> &ChannelManager::getAllChannels() const
{
    return channels_;
}