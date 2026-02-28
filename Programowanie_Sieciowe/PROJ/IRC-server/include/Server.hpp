#pragma once

#include <map>
#include <memory>
#include <string>

class Client;
class CommandHandler;
class ChannelManager;

class Server
{
public:
    explicit Server(int port);
    ~Server();

    void run();

    void sendToClient(const Client &client, const std::string &message);

    bool isNickInUse(const std::string &nick, const Client *excludeClient = nullptr) const;
    void checkClientRegistration(Client &client);
    const std::map<int, std::unique_ptr<Client>> &getAllClients() const { return clients_; }
    Client *getClientByNick(const std::string &nick);
    void disconnectClient(int clientSocket, const std::string &reason = "");

    ChannelManager *getChannelManager() { return channelManager_.get(); }

    void stop() { running_ = false; }

    bool checkUsernameAvailability(const std::string &username, const Client *excludeClient = nullptr) const;

private:
    void initializeCommands();
    void acceptNewClient();
    void handleClientData(int clientSocket);
    void removeClient(int clientSocket);
    void processClientMessage(Client &client);

    int port_;
    int serverSocket_;
    int epollFd_;
    bool running_;

    std::map<int, std::unique_ptr<Client>> clients_;
    std::unique_ptr<CommandHandler> commandHandler_;
    std::unique_ptr<ChannelManager> channelManager_;
};