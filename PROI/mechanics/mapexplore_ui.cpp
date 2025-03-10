/**
 * Name: mapexplore_ui.cpp
 * Purpose: class representing ui elements
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "mapexplore_ui.h"

void MapExploreUI::init(std::string customShortcutsPath)
{
    // Add player status
    if (!playerStatusTexture.loadFromFile("assets/img/ui/player_status.png"))
    {
        std::cerr << "Error: player status" << std::endl;
    }
    playerStatus.setTexture(playerStatusTexture);
    playerStatus.setPosition(0, 0);
    playerStatus.setColor(sf::Color(255, 255, 255, 200));

    // Add shortcuts
    if (!shortcutsTexture.loadFromFile(customShortcutsPath))
    {
        std::cerr << "Error: shortcuts" << std::endl;
    }
    shortcuts.setTexture(shortcutsTexture);
    shortcuts.setScale(0.6f, 0.6f);
    shortcuts.setPosition(300, 970);
    shortcuts.setColor(sf::Color(255, 255, 255, 200));

    if (!font.loadFromFile("assets/fonts/CrimsonText-Regular.ttf"))
    {
        std::cerr << "Error: MapexploreUI font" << std::endl;
    };
    text.setFont(font);
    text.setCharacterSize(16);
    text.setFillColor(sf::Color(255, 255, 255, 200));
    text.setPosition(10, 10);
    text.setString("Zdrowie");

    healthBar.setSize(sf::Vector2f(140, 16));
    healthBar.setFillColor(sf::Color(255, 0, 0, 200));
    healthBar.setPosition(15, 15);
}

void MapExploreUI::update(PlayerStats &playerStats)
{
    healthBar.setSize(sf::Vector2f(playerStats.getHealth() * 1.4f, 16));
}

void MapExploreUI::draw(sf::RenderWindow &window)
{
    playerStatus.setPosition(window.getView().getCenter().x - window.getView().getSize().x / 2.0f + 1700,
                             window.getView().getCenter().y - window.getView().getSize().y / 2.0f + 10);
    window.draw(playerStatus);

    shortcuts.setPosition(window.getView().getCenter().x - window.getView().getSize().x / 2.0f + 25,
                          window.getView().getCenter().y - window.getView().getSize().y / 2.0f + 1000);
    window.draw(shortcuts);

    text.setPosition(window.getView().getCenter().x - window.getView().getSize().x / 2.0f + 1680,
                     window.getView().getCenter().y - window.getView().getSize().y / 2.0f + 182);
    window.draw(text);

    healthBar.setPosition(window.getView().getCenter().x - window.getView().getSize().x / 2.0f + 1751,
                          window.getView().getCenter().y - window.getView().getSize().y / 2.0f + 185);
    window.draw(healthBar);
}