CXX := g++
CXXFLAGS := -std=c++17 -Wall -Wextra -Wpedantic -O2 -Iinclude
LDFLAGS := -lfmt

SRC_DIR := src
BUILD_DIR := build
BIN_DIR := bin

# Executable name
TARGET := $(BIN_DIR)/irc_server

# Source files
SOURCES := $(SRC_DIR)/main.cpp \
		$(SRC_DIR)/Logger.cpp \
		$(SRC_DIR)/Server.cpp \
		$(SRC_DIR)/client/Client.cpp \
		$(SRC_DIR)/parser/MessageParser.cpp \
		$(SRC_DIR)/commands/CommandHandler.cpp \
		$(SRC_DIR)/commands/CapCommand.cpp \
		$(SRC_DIR)/commands/NickCommand.cpp \
		$(SRC_DIR)/commands/UserCommand.cpp \
		$(SRC_DIR)/commands/PingCommand.cpp \
		$(SRC_DIR)/commands/QuitCommand.cpp \
		$(SRC_DIR)/commands/WhoCommand.cpp \
		$(SRC_DIR)/commands/PrivmsgCommand.cpp \
		$(SRC_DIR)/commands/PassCommand.cpp \
		$(SRC_DIR)/commands/JoinCommand.cpp \
		$(SRC_DIR)/commands/PartCommand.cpp \
		$(SRC_DIR)/commands/KickCommand.cpp \
		$(SRC_DIR)/commands/ListCommand.cpp \
		$(SRC_DIR)/channel/Channel.cpp \
		$(SRC_DIR)/channel/ChannelManager.cpp \

# Object files
OBJECTS := $(SOURCES:$(SRC_DIR)/%.cpp=$(BUILD_DIR)/%.o)

# Dependencies
DEPS := $(OBJECTS:.o=.d)

# Default target
all: $(TARGET)

# Link
$(TARGET): $(OBJECTS)
	@mkdir -p $(@D)
	$(CXX) $(OBJECTS) -o $@ $(LDFLAGS)
	@echo "Build finished: $@"

# Compile to object files
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp
	@mkdir -p $(@D)
	$(CXX) $(CXXFLAGS) -MMD -MP -c $< -o $@


# Include dependencies
-include $(DEPS)

# Clean build
clean:
	rm -rf $(BUILD_DIR) $(BIN_DIR)
	@echo "Cleaned build and bin directories"

# Run server
run: $(TARGET)
	$(TARGET)

# Run with default port
run-default: $(TARGET)
	$(TARGET) 6667

# Show help
help:
	@echo "Available targets:"
	@echo "  make            - Build the project"
	@echo "  make clean      - Remove compiled files"
	@echo "  make run        - Build and run the server"
	@echo "  make run-default- Build and run the server on port 6667"
	@echo "  make help       - Show this help"

.PHONY: all clean run run-default help directories
