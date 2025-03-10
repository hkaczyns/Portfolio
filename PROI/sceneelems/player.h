/**
 * Name: player.h
 * Purpose: class representing the player character on the map
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "sceneryelement.h"
#include "blockade.h"
#include <SFML/Audio.hpp>

class Player : public SceneryElement
{
private:
    bool isWalking;
    float moveSpeed{1000.0f};
    sf::Vector2f movement;
    sf::Texture attackTexture;
    std::vector<sf::Texture> textures_right;
    std::vector<sf::Texture> textures_left;
    std::vector<sf::Texture> textures_up;
    std::vector<sf::Texture> textures_down;
    std::vector<sf::Texture> textures_stand;

    std::vector<sf::Texture> *newDirection;

    std::vector<sf::Texture> add_sprites(std::string pos);

    // Counters
    int sproutState{0};
    int frameCounter{0};

    // Stepping sound effect
    sf::Sound stepSound;

public:
    Player();
    void handleInput(float deltaTime);
    void move();
    void update(SceneryElement &background, std::vector<Blockade> &blockades);
    sf::Vector2f getPosition();
    sf::Texture getAttackTexture();
    sf::Texture loadAttackTexture();
    void attack();
};