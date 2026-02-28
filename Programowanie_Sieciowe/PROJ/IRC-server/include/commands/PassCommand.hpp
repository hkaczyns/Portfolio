#pragma once

#include "../include/commands/Command.hpp"

class Client;
class Server;
class PassCommand : public Command
{
public:
    void execute(Client &client, const std::vector<std::string> &tokens, Server *server);

    std::string getName() const { return "PASS"; }
    bool requiresRegistration() const { return false; }
    bool requiresPassword() const { return false; }
};