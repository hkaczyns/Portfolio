#pragma once

#include <string>
#include <set>

class Client
{
public:
    explicit Client(int socket);
    ~Client() = default;

    int getSocket() const { return socket_; }
    const std::string &getNick() const { return nick_; }
    const std::string &getUsername() const { return username_; }
    const std::string &getRealname() const { return realname_; }
    const std::string &getBuffer() const { return buffer_; }
    bool isRegistered() const { return registered_; }
    bool isCapNegotiating() const { return capNegotiation_; }
    bool isAuthenticated() const { return authenticated_; }

    void setNick(const std::string &nick) { nick_ = nick; }
    void setUsername(const std::string &username) { username_ = username; }
    void setRealname(const std::string &realname) { realname_ = realname; }
    void setRegistered(bool registered) { registered_ = registered; }
    void setCapNegotiation(bool capNegotiation) { capNegotiation_ = capNegotiation; }
    void setAuthenticated(bool authenticated) { authenticated_ = authenticated; }

    void appendToBuffer(const std::string &data) { buffer_ += data; }
    void clearBuffer() { buffer_.clear(); }
    std::string extractLine();

    void joinChannel(const std::string &channel);
    void leaveChannel(const std::string &channel);
    bool isInChannel(const std::string &channel) const;
    const std::set<std::string> &getChannels() const { return channels_; }

private:
    int socket_;
    std::string nick_;
    std::string username_;
    std::string realname_;
    std::string buffer_;
    bool registered_;
    bool capNegotiation_;
    bool authenticated_;
    std::set<std::string> channels_; // Channels the client belongs to
};