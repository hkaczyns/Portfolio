#pragma once

#include <string>
#include <vector>

class MessageParser
{
public:
    static std::vector<std::string> parse(const std::string &message);

    static bool isValidNick(const std::string &nick);
    static bool isValidChannel(const std::string &channel);
};