/**
 * Name: menuscene.h
 * Purpose: main menu scene
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "scene.h"
#include <SFML/Graphics.hpp>
#include "../mechanics/staticcamera.h"
#include "../sceneelems/staticelement.h"
#include "scenemanager.h"

class MenuScene : public Scene
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
    MenuScene(sf::RenderWindow &window, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    virtual ~MenuScene() {}
    void init() override;
    void loadScenery() override {};
    void handleInput(sf::Event event) override;
    void update() override;
    void customUpdate() override {};
    void render() override;
    void cleanup() override {}
};