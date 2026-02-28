#include "../include/Channel.hpp"
#include <algorithm>

Channel::Channel(const std::string &name)
    : name_(name), topic_("")
{
}

void Channel::addMember(int clientSocket)
{
    members_.insert(clientSocket);
}

void Channel::removeMember(int clientSocket)
{
    members_.erase(clientSocket);
    // If the member was an operator, remove them from operators
    operators_.erase(clientSocket);
}

bool Channel::hasMember(int clientSocket) const
{
    return members_.find(clientSocket) != members_.end();
}

void Channel::addOperator(int clientSocket)
{
    // Only a member can be promoted to operator
    if (hasMember(clientSocket))
    {
        operators_.insert(clientSocket);
    }
}

void Channel::removeOperator(int clientSocket)
{
    operators_.erase(clientSocket);
}

bool Channel::isOperator(int clientSocket) const
{
    return operators_.find(clientSocket) != operators_.end();
}
