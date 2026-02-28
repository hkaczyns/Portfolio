/**
 * Name: mapexplore_ui.h
 * Purpose: class representing ui elements
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include <iostream>
#include "playerstats.h"

class MapExploreUI
{
private:
    // Player status (upper right corner)
    sf::Texture playerStatusTexture;
    sf::Sprite playerStatus;

    // Shortcuts
    sf::Texture shortcutsTexture;
    sf::Sprite shortcuts;

    sf::Font font;
    sf::Text text;
    sf::RectangleShape healthBar;

public:
    MapExploreUI(){};
    void init(std::string customShortcutsPath = "assets/img/ui/mapexplore_shortcuts.png");
    void update(PlayerStats &playerStats);
    void draw(sf::RenderWindow &window);
};