#pragma once

#include <string>

// Server configuration
constexpr int DEFAULT_PORT = 6667;
constexpr int BUFFER_SIZE = 512;
constexpr int MAX_EVENTS = 64;
constexpr const char *SERVER_NAME = "myircserver.local";
constexpr const char *SERVER_VERSION = "0.1";
constexpr const char *SERVER_PASSWORD = "123456";

// Limits
constexpr size_t MAX_NICK_LENGTH = 9;
constexpr size_t MAX_CHANNEL_LENGTH = 50;
constexpr size_t MAX_MESSAGE_LENGTH = 510;