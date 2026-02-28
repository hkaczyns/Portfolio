#include "../include/Server.hpp"
#include "../include/Client.hpp"
#include "../include/commands/CommandHandler.hpp"
#include "../include/MessageParser.hpp"
#include "../include/Config.hpp"
#include "../include/ChannelManager.hpp"
#include "../include/Channel.hpp"

#include "../include/commands/CapCommand.hpp"
#include "../include/commands/NickCommand.hpp"
#include "../include/commands/UserCommand.hpp"
#include "../include/commands/PingCommand.hpp"
#include "../include/commands/QuitCommand.hpp"
#include "../include/commands/WhoCommand.hpp"
#include "../include/commands/PrivmsgCommand.hpp"
#include "../include/commands/PassCommand.hpp"
#include "../include/commands/JoinCommand.hpp"
#include "../include/commands/PartCommand.hpp"
#include "../include/commands/KickCommand.hpp"
#include "../include/commands/ListCommand.hpp"

#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <sys/epoll.h>
#include <netinet/in.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <fcntl.h>
#include <errno.h>
#include <spdlog/spdlog.h>

// Set socket to non-blocking
static int setNonBlocking(int socket)
{
    int flags = fcntl(socket, F_GETFL, 0);
    if (flags == -1)
    {
        spdlog::error("Error getting socket flags: {}", strerror(errno));
        return -1;
    }

    if (fcntl(socket, F_SETFL, flags | O_NONBLOCK) == -1)
    {
        spdlog::error("Error setting non-blocking mode: {}", strerror(errno));
        return -1;
    }

    return 0;
}

Server::Server(int port)
    : port_(port),
      serverSocket_(-1),
      epollFd_(-1),
      running_(false),
      commandHandler_(std::make_unique<CommandHandler>()),
      channelManager_(std::make_unique<ChannelManager>())
{

    initializeCommands();
}

Server::~Server()
{
    if (epollFd_ >= 0)
    {
        close(epollFd_);
    }
    if (serverSocket_ >= 0)
    {
        close(serverSocket_);
    }
}

void Server::initializeCommands()
{
    commandHandler_->registerCommand(std::make_unique<CapCommand>());
    commandHandler_->registerCommand(std::make_unique<NickCommand>());
    commandHandler_->registerCommand(std::make_unique<UserCommand>());
    commandHandler_->registerCommand(std::make_unique<PingCommand>());
    commandHandler_->registerCommand(std::make_unique<QuitCommand>());
    commandHandler_->registerCommand(std::make_unique<WhoCommand>());
    commandHandler_->registerCommand(std::make_unique<PrivmsgCommand>());
    commandHandler_->registerCommand(std::make_unique<PassCommand>());
    commandHandler_->registerCommand(std::make_unique<JoinCommand>());
    commandHandler_->registerCommand(std::make_unique<PartCommand>());
    commandHandler_->registerCommand(std::make_unique<KickCommand>());
    commandHandler_->registerCommand(std::make_unique<ListCommand>());
}

void Server::sendToClient(const Client &client, const std::string &message)
{
    std::string msg = message;
    if (msg.find("\r\n") == std::string::npos)
    {
        msg += "\r\n";
    }
    send(client.getSocket(), msg.c_str(), msg.length(), 0);
    spdlog::debug("[SENT to {}] {}", client.getSocket(), msg);
}

bool Server::isNickInUse(const std::string &nick, const Client *excludeClient) const
{
    for (const auto &[socket, client] : clients_)
    {
        if (client.get() != excludeClient && client->getNick() == nick)
        {
            return true;
        }
    }
    return false;
}

void Server::checkClientRegistration(Client &client)
{
    if (!client.isRegistered() && !client.getNick().empty() &&
        !client.getUsername().empty() && !client.isCapNegotiating())
    {

        client.setRegistered(true);
        spdlog::info("Client {} registered with nick: {}", client.getSocket(), client.getNick());

        sendToClient(client, ":" + std::string(SERVER_NAME) + " 001 " + client.getNick() +
                                 " :Welcome to the IRC Network " + client.getNick() + "!" +
                                 client.getUsername() + "@localhost");
        spdlog::trace("Sent welcome messages to client {}", client.getSocket());
        sendToClient(client, ":" + std::string(SERVER_NAME) + " 002 " + client.getNick() +
                                 " :Your host is " + std::string(SERVER_NAME) + ", running version " +
                                 std::string(SERVER_VERSION));
        spdlog::trace("Sent message 002 to client {}", client.getSocket());
        sendToClient(client, ":" + std::string(SERVER_NAME) + " 003 " + client.getNick() +
                                 " :This server was created just now");
        spdlog::trace("Sent message 003 to client {}", client.getSocket());
        sendToClient(client, ":" + std::string(SERVER_NAME) + " 004 " + client.getNick() + " " +
                                 std::string(SERVER_NAME) + " " + std::string(SERVER_VERSION) + " o o");
        spdlog::trace("Sent message 004 to client {}", client.getSocket());
        sendToClient(client, ":" + std::string(SERVER_NAME) + " 375 " + client.getNick() +
                                 " :- " + std::string(SERVER_NAME) + " Message of the day -");
        spdlog::trace("Sent message 375 to client {}", client.getSocket());
        sendToClient(client, ":" + std::string(SERVER_NAME) + " 372 " + client.getNick() +
                                 " :- Welcome to the our Z51 IRC server!");
        spdlog::trace("Sent message 372 to client {}", client.getSocket());
        sendToClient(client, ":" + std::string(SERVER_NAME) + " 376 " + client.getNick() +
                                 " :End of /MOTD command.");
        spdlog::trace("Sent message 376 to client {}", client.getSocket());
    }
}

Client *Server::getClientByNick(const std::string &nick)
{
    for (auto &[socket, client] : clients_)
    {
        if (client->getNick() == nick && client->isRegistered())
        {
            return client.get();
        }
    }
    return nullptr;
}

void Server::disconnectClient(int clientSocket, const std::string &reason)
{
    auto it = clients_.find(clientSocket);
    if (it == clients_.end())
    {
        spdlog::warn("Attempted to disconnect non-existent client: {}", clientSocket);
        return;
    }

    Client *client = it->second.get();
    std::string nick = client->isRegistered() ? client->getNick() : "unregistered";

    spdlog::info("Forcing disconnection of client {} (nick {})", clientSocket, nick);
    if (!reason.empty())
    {
        spdlog::info("Reason for disconnection: {}", reason);
    }

    if (!reason.empty())
    {
        sendToClient(*client, "ERROR :Closing Link: " + reason);
    }

    removeClient(clientSocket);
}

void Server::processClientMessage(Client &client)
{
    std::string line = client.extractLine();
    while (!line.empty())
    {
        if (!line.empty())
        {
            spdlog::debug("[RECEIVED from {}] {}", client.getSocket(), line);

            std::vector<std::string> tokens = MessageParser::parse(line);

            if (!tokens.empty())
            {
                commandHandler_->handleCommand(client, tokens, this);
            }
        }

        line = client.extractLine();
    }
}

void Server::acceptNewClient()
{
    struct sockaddr_in clientAddr;
    socklen_t clientLen = sizeof(clientAddr);

    int clientSocket = accept(serverSocket_, (struct sockaddr *)&clientAddr, &clientLen);
    if (clientSocket < 0)
    {
        if (errno != EAGAIN && errno != EWOULDBLOCK)
        {
            spdlog::error("Error accepting connection: {}", strerror(errno));
        }
        return;
    }

    if (setNonBlocking(clientSocket) < 0)
    {
        close(clientSocket);
        return;
    }

    spdlog::info("New client connected: {}:{}. Socket: {}",
                 inet_ntoa(clientAddr.sin_addr), ntohs(clientAddr.sin_port), clientSocket);

    struct epoll_event event;
    event.events = EPOLLIN | EPOLLET; // Edge-triggered
    event.data.fd = clientSocket;

    if (epoll_ctl(epollFd_, EPOLL_CTL_ADD, clientSocket, &event) < 0)
    {
        spdlog::error("Error adding client to epoll: {}", strerror(errno));
        close(clientSocket);
        return;
    }

    // Create client object and add to map
    clients_[clientSocket] = std::make_unique<Client>(clientSocket);
}

void Server::handleClientData(int clientSocket)
{
    auto it = clients_.find(clientSocket);
    if (it == clients_.end())
    {
        spdlog::error("Unknown socket: {}", clientSocket);
        return;
    }

    Client *client = it->second.get();
    char buffer[BUFFER_SIZE];
    bool shouldRemove = false;

    while (true)
    {
        memset(buffer, 0, BUFFER_SIZE);
        int bytesReceived = recv(clientSocket, buffer, BUFFER_SIZE - 1, 0);

        if (bytesReceived > 0)
        {
            spdlog::debug("[RECEIVED {} bytes from {}] {}",
                          bytesReceived, clientSocket, std::string(buffer, bytesReceived));
            client->appendToBuffer(std::string(buffer, bytesReceived));
            processClientMessage(*client);
        }
        else if (bytesReceived == 0)
        {
            spdlog::info("Client {} disconnected", clientSocket);
            shouldRemove = true;
            break;
        }
        else
        {
            if (errno == EAGAIN || errno == EWOULDBLOCK)
            {
                // All data was read
                break;
            }
            else
            {
                spdlog::error("Error receiving data from {}: {}", clientSocket, strerror(errno));
                shouldRemove = true;
                break;
            }
        }
    }

    if (shouldRemove)
    {
        removeClient(clientSocket);
    }
}

void Server::removeClient(int clientSocket)
{
    spdlog::info("Removing client with socket {}", clientSocket);

    // Remove from epoll
    epoll_ctl(epollFd_, EPOLL_CTL_DEL, clientSocket, nullptr);

    close(clientSocket);
    clients_.erase(clientSocket);
}

bool Server::checkUsernameAvailability(const std::string &username, const Client *excludeClient) const
{
    for (const auto &[socket, client] : clients_)
    {
        if (client.get() != excludeClient && client->getUsername() == username)
        {
            return false;
        }
    }
    return true;
}

void Server::run()
{
    serverSocket_ = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket_ < 0)
    {
        spdlog::error("Error creating socket: {}", strerror(errno));
        return;
    }

    // Set SO_REUSEADDR
    int opt = 1;
    if (setsockopt(serverSocket_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0)
    {
        spdlog::error("Error setting socket options: {}", strerror(errno));
        close(serverSocket_);
        return;
    }

    // Set to non-blocking
    if (setNonBlocking(serverSocket_) < 0)
    {
        close(serverSocket_);
        return;
    }

    // Bind socket
    struct sockaddr_in serverAddr;
    memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(port_);

    if (bind(serverSocket_, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) < 0)
    {
        spdlog::error("Error binding socket to port {}: {}", port_, strerror(errno));
        close(serverSocket_);
        return;
    }

    if (listen(serverSocket_, SOMAXCONN) < 0)
    {
        spdlog::error("Error listening on socket: {}", strerror(errno));
        close(serverSocket_);
        return;
    }

    // Create epoll instance
    epollFd_ = epoll_create1(0);
    if (epollFd_ < 0)
    {
        spdlog::error("Error creating epoll instance: {}", strerror(errno));
        close(serverSocket_);
        return;
    }

    // Add server socket to epoll
    struct epoll_event event;
    event.events = EPOLLIN | EPOLLET; // Edge-triggered
    event.data.fd = serverSocket_;

    if (epoll_ctl(epollFd_, EPOLL_CTL_ADD, serverSocket_, &event) < 0)
    {
        spdlog::error("Error adding server socket to epoll: {}", strerror(errno));
        close(epollFd_);
        close(serverSocket_);
        return;
    }

    std::cout << "\n=====================================" << std::endl;
    std::cout << "IRC Server started!" << std::endl;
    std::cout << "Port: " << port_ << std::endl;
    std::cout << "Waiting for connections" << std::endl;
    std::cout << "=====================================\n"
              << std::endl;

    running_ = true;
    struct epoll_event events[MAX_EVENTS];

    // Main event loop
    while (running_)
    {
        int numEvents = epoll_wait(epollFd_, events, MAX_EVENTS, -1);

        if (numEvents < 0)
        {
            if (errno == EINTR)
            {
                continue; // Interrupted by signal
            }
            spdlog::error("Error in epoll_wait: {}", strerror(errno));
            break;
        }

        // Processing events
        for (int i = 0; i < numEvents; i++)
        {
            int fd = events[i].data.fd;

            if (fd == serverSocket_)
            {
                // Accept all pending connections because of edge-triggered mode
                while (true)
                {
                    acceptNewClient();
                    if (errno == EAGAIN || errno == EWOULDBLOCK)
                    {
                        break;
                    }
                }
            }
            else
            {
                handleClientData(fd);
            }
        }
    }

    // Cleanup
    spdlog::info("Shutting down server...");
    for (auto &[socket, client] : clients_)
    {
        sendToClient(*client, ":" + std::string(SERVER_NAME) + " ERROR :Closing Link: " + client.get()->getNick() + " (Server shutting down)\r\n");
    }
    clients_.clear();
}
