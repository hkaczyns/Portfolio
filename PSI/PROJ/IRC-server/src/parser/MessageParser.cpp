#include "../include/MessageParser.hpp"
#include "../include/Config.hpp"
#include <sstream>
#include <algorithm>

std::vector<std::string> MessageParser::parse(const std::string &message)
{
    std::vector<std::string> tokens;
    std::istringstream iss(message);
    std::string token;

    while (iss >> token)
    {
        if (token[0] == ':')
        {
            std::string rest;
            std::getline(iss, rest);                  // Get the rest of the line
            tokens.push_back(token.substr(1) + rest); // Push the rest as one token
            break;
        }
        tokens.push_back(token);
    }

    return tokens;
}

bool MessageParser::isValidNick(const std::string &nick)
{
    if (nick.empty() || nick.length() > MAX_NICK_LENGTH)
    {
        return false;
    }

    // Nick must start with a letter
    if (!std::isalpha(nick[0]))
    {
        return false;
    }

    // Name must consist of letters, digits, '-', and '_'
    for (char c : nick)
    {
        if (!std::isalnum(c) && c != '-' && c != '_')
        {
            return false;
        }
    }

    return true;
}

bool MessageParser::isValidChannel(const std::string &channel)
{
    if (channel.empty() || channel.length() > MAX_CHANNEL_LENGTH)
    {
        return false;
    }

    // Channel name must start with '#' or '&'
    if (channel[0] != '#' && channel[0] != '&')
    {
        return false;
    }

    // Name cannot contain spaces, commas, or control characters
    for (char c : channel)
    {
        if (c == ' ' || c == ',' || c == ':' || c == '\r' || c == '\n')
        {
            return false;
        }
    }

    return true;
}