#pragma once

#include <string>
#include <map>
#include <memory>
#include <vector>

class Channel;
class Client;

class ChannelManager
{
public:
    ChannelManager() = default;
    ~ChannelManager() = default;

    Channel *createChannel(const std::string &name, int creatorSocket);
    Channel *getChannel(const std::string &name);
    bool channelExists(const std::string &name) const;
    void removeChannel(const std::string &name);

    bool joinChannel(const std::string &channelName, int clientSocket);
    void leaveChannel(const std::string &channelName, int clientSocket);
    void leaveAllChannels(int clientSocket);
    bool kickFromChannel(const std::string &channelName, int operatorSocket, int targetSocket);

    std::vector<std::string> getChannelList() const;
    std::vector<int> getChannelMembers(const std::string &channelName) const;
    const std::map<std::string, std::unique_ptr<Channel>> &getAllChannels() const;

private:
    std::map<std::string, std::unique_ptr<Channel>> channels_;
};