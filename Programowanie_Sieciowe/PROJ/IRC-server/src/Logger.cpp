#include "../include/Logger.hpp"

#include <spdlog/spdlog.h>
#include <spdlog/sinks/basic_file_sink.h>
#include <spdlog/sinks/stdout_color_sinks.h>

namespace logger
{

    void init(const std::string &logFilePath)
    {
        static bool initialized = false;
        if (initialized)
        {
            return;
        }

        auto console_sink = std::make_shared<spdlog::sinks::stdout_color_sink_mt>();
        auto file_sink = std::make_shared<spdlog::sinks::basic_file_sink_mt>(logFilePath, true);

        auto logger = std::make_shared<spdlog::logger>(
            "multi_logger", spdlog::sinks_init_list{console_sink, file_sink});

        spdlog::set_default_logger(std::move(logger));
        spdlog::set_level(spdlog::level::trace);
        spdlog::set_pattern("[%Y-%m-%d %H:%M:%S] [%^%l%$] %v");

        initialized = true;
    }

    void shutdown()
    {
        spdlog::shutdown();
    }

}
