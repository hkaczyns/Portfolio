#pragma once

#include "../include/commands/Command.hpp"

class UserCommand : public Command
{
public:
    void execute(Client &client, const std::vector<std::string> &tokens, Server *server) override;
    std::string getName() const override { return "USER"; }
    bool requiresRegistration() const override { return false; }
};