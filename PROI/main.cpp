/**
 * Name: main.cpp
 * Purpose: main game loop
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include "scenes/scenemanager.h"
#include "mechanics/playerstats.h"
#include "levels/level1.h"
#include <iostream>
#include <array>
#include <vector>

int main()
{
    // Create a window
    sf::RenderWindow window(sf::VideoMode(1920, 1080), "Szpady i Zwady");
    window.setFramerateLimit(60);

    // Clock
    sf::Clock clock;

    // Create player stats
    PlayerStats playerStats;

    // Create a scene manager
    SceneManager sceneManager;
    sceneManager.changeScene(SceneID::MainMenu, window, clock, playerStats);

    // Icon
    sf::Image icon;
    if (!icon.loadFromFile("assets/img/others/icon.png"))
    {
        std::cerr << "Could not load icon" << std::endl;
        return -1;
    }
    window.setIcon(icon.getSize().x, icon.getSize().y, icon.getPixelsPtr());

    // Game loop
    while (window.isOpen())
    {
        sf::Event event;
        while (window.pollEvent(event))
        {
            if (event.type == sf::Event::Closed)
                window.close();
        }
        sceneManager.handleInput(event);
        sceneManager.update();
        sceneManager.render();

        // Display the new frame
        window.display();
    }

    return 0;
}
