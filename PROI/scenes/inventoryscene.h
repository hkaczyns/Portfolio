/**
 * Name: inventoryscene.h
 * Purpose: scene handling viewing of the player's inventory
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <map>
#include "scene.h"
#include "../sceneelems/staticelement.h"
#include "../mechanics/staticcamera.h"
#include "../mechanics/playerstats.h"
#include "../scenes/scenemanager.h"

class InventoryScene : public Scene
{

protected:
    // Window
    sf::RenderWindow &window;

    // Clock
    sf::Clock &clock;

    // Background
    StaticElement background;

    // View
    StaticCamera staticCamera;

    // Music
    sf::Music music;

    // Font
    sf::Font font;
    sf::Font descrFont;

    // Text
    sf::Text mainText;
    sf::Text menuText1;

    // Asset textures and sprites
    std::map<std::string, sf::Texture> textures;
    std::vector<sf::Sprite> itemSprites;

    // Items' quantities
    std::vector<sf::CircleShape> quantityCircles;
    std::vector<sf::Text> itemQuantityTexts;

    // Chosen item
    sf::Sprite chosenItemSprite;
    sf::Text itemNameText;
    sf::Text descriptionText;
    int selectedItemIndex = -1;

    // Border for selected item
    sf::Sprite borderSprite;
    float borderAlpha = 0;

    // Sounds
    sf::SoundBuffer initSoundBuffer;
    sf::SoundBuffer selectSoundBuffer;
    sf::Sound initSound;
    sf::Sound selectSound;

public:
    InventoryScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
    void loadScenery() override;
    void putText(sf::Text &text, sf::Vector2f position);
    void handleInput(sf::Event event) override;
    void update() override;
    void customUpdate() override {};
    void render() override;
    void cleanup() override;
};