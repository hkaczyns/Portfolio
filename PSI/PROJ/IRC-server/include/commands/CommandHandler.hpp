#pragma once

#include <map>
#include <string>
#include <memory>
#include <vector>

class Command;
class Client;
class Server;

class CommandHandler
{
public:
    CommandHandler();
    ~CommandHandler() = default;

    void registerCommand(std::unique_ptr<Command> command);
    void handleCommand(Client &client, const std::vector<std::string> &tokens, Server *server);

private:
    std::map<std::string, std::unique_ptr<Command>> commands_;
};