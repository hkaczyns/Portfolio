#pragma once

#include <string>
#include <vector>
#include <memory>

class Client;
class Server;

class Command
{
public:
    virtual ~Command() = default;

    virtual void execute(Client &client, const std::vector<std::string> &tokens, Server *server) = 0;
    virtual std::string getName() const = 0;

    virtual bool requiresRegistration() const { return true; }
    virtual bool requiresPassword() const { return true; }
};