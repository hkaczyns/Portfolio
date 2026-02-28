#include "../include/Client.hpp"

Client::Client(int socket)
    : socket_(socket), registered_(false), capNegotiation_(false), authenticated_(false)
{
}

std::string Client::extractLine()
{
    size_t pos = buffer_.find("\r\n");
    if (pos == std::string::npos)
    {
        return "";
    }

    std::string line = buffer_.substr(0, pos);
    buffer_.erase(0, pos + 2);
    return line;
}

void Client::joinChannel(const std::string &channel)
{
    channels_.insert(channel);
}

void Client::leaveChannel(const std::string &channel)
{
    channels_.erase(channel);
}

bool Client::isInChannel(const std::string &channel) const
{
    return channels_.find(channel) != channels_.end();
}