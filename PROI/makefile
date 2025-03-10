CC = g++
FLAGS = -std=c++17 -Wall -g

SRC = $(shell find . -name '*.cpp')
OBJ = $(SRC:.cpp=.o)

all: main

main: $(OBJ)
	$(CC) -o $@ $^ -lsfml-graphics -lsfml-window -lsfml-system -lsfml-audio

%.o: %.cpp
	$(CC) $(FLAGS) -c $< -o $@

clean:
	rm -rf main $(OBJ)