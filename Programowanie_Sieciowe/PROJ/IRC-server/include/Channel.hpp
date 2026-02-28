#pragma once

#include <string>
#include <set>
#include <memory>

class Client;

class Channel
{
public:
    explicit Channel(const std::string &name);
    ~Channel() = default;

    const std::string &getName() const { return name_; }
    const std::set<int> &getMembers() const { return members_; }
    const std::set<int> &getOperators() const { return operators_; }
    const std::string &getTopic() const { return topic_; }

    void addMember(int clientSocket);
    void removeMember(int clientSocket);
    bool hasMember(int clientSocket) const;
    size_t getMemberCount() const { return members_.size(); }

    void addOperator(int clientSocket);
    void removeOperator(int clientSocket);
    bool isOperator(int clientSocket) const;

    void setTopic(const std::string &topic) { topic_ = topic; }

private:
    std::string name_;
    std::string topic_;
    std::set<int> members_;   // Sockets of channel members
    std::set<int> operators_; // Sockets of channel operators
};