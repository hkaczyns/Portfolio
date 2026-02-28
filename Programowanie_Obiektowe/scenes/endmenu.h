/**
 * Name: endmenu.h
 * Purpose: scene handling menu scene after game completion
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "scene.h"
#include <SFML/Graphics.hpp>
#include "../mechanics/staticcamera.h"
#include "../sceneelems/staticelement.h"
#include "scenemanager.h"

class EndMenuScene : public Scene
{
protected:
    sf::RenderWindow &window;

    // Clock
    sf::Clock &clock;

    // Background
    StaticElement background;

    // View
    StaticCamera staticCamera;

    sf::Font font;
    sf::Text mainText;
    sf::Text smallerText;
    sf::RectangleShape newGameButton;
    sf::Text newGameButtonText;

public:
    EndMenuScene(sf::RenderWindow &window, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    virtual ~EndMenuScene() {}
    void init() override;
    void loadScenery() override {};
    void handleInput(sf::Event event) override;
    void update() override;
    void customUpdate() override {};
    void render() override;
    void cleanup() override {}
};