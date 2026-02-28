#pragma once

#include "../include/commands/Command.hpp"

class CapCommand : public Command
{
public:
    void execute(Client &client, const std::vector<std::string> &tokens, Server *server) override;
    std::string getName() const override { return "CAP"; }
    bool requiresRegistration() const override { return false; }
};