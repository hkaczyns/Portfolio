#pragma once

#include "../include/commands/Command.hpp"

class JoinCommand : public Command
{
public:
    void execute(Client &client, const std::vector<std::string> &tokens, Server *server) override;
    std::string getName() const override { return "JOIN"; }
};