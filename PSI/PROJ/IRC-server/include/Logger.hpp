#pragma once

#include <string>

namespace logger
{
    void init(const std::string &logFilePath = "app.log");
    void shutdown();
}
