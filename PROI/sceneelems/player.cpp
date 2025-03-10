/**
 * Name: player.cpp
 * Purpose: class representing the player character on the map
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "player.h"
#include <iostream>

Player::Player()
{
    // Load a sprite
    textures_right = add_sprites("right");
    textures_left = add_sprites("left");
    textures_up = add_sprites("up");
    textures_down = add_sprites("down");
    textures_stand = add_sprites("stand");
    attackTexture.loadFromFile("assets/img/sprites/attack1.png");

    sprite.setTexture(textures_stand[0]);

    // Add sound of walking
    static sf::SoundBuffer stepSoundBuffer;
    if (!stepSoundBuffer.loadFromFile("assets/audio/music/footstep.wav"))
    {
        std::cerr << "Error: sound" << std::endl;
        return;
    }

    stepSound.setBuffer(stepSoundBuffer);
    stepSound.setVolume(30);
}

void Player::handleInput(float deltaTime)
{
    isWalking = false;
    newDirection = &textures_stand;

    movement = sf::Vector2f(0.f, 0.f);

    if (sf::Keyboard::isKeyPressed(sf::Keyboard::W))
    {
        movement.y -= moveSpeed * deltaTime;
        isWalking = true;
        newDirection = &textures_up;
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::S))
    {
        movement.y += moveSpeed * deltaTime;
        isWalking = true;
        newDirection = &textures_down;
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::A))
    {
        movement.x -= moveSpeed * deltaTime;
        isWalking = true;
        newDirection = &textures_left;
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::D))
    {
        movement.x += moveSpeed * deltaTime;
        isWalking = true;
        newDirection = &textures_right;
    }
}

void Player::move()
{
    sprite.move(movement);
}

void Player::update(SceneryElement &background, std::vector<Blockade> &blockades)
{
    sf::Vector2f oldPos = sprite.getPosition();
    move();
    for (Blockade &blockade : blockades)
    {
        if (blockade.rectangle.getGlobalBounds().intersects(sprite.getGlobalBounds()))
        {
            sprite.setPosition(oldPos);
            return;
        }
    }

    // Dimensions of the background
    float bgWidth = background.getWidth();
    float bgHeight = background.getHeight();

    // Block the movement if the camera would move out of the background
    oldPos = sprite.getPosition();

    // windowWidth / 2.0f - bo sprite jest w połowie ekranu
    float newX = std::max(0.f, std::min(sprite.getPosition().x * 1.0f, bgWidth - sprite.getGlobalBounds().width));
    float newY = std::max(0.f, std::min(sprite.getPosition().y * 1.0f, bgHeight - sprite.getGlobalBounds().height));

    sprite.setPosition(newX, newY);

    bool movementBlocked = false;
    if (isWalking and (oldPos.x != sprite.getPosition().x or oldPos.y != sprite.getPosition().y))
    {
        movementBlocked = true;
    }

    // Change the texture and add the sound depending on the direction
    frameCounter++;
    if (isWalking and !movementBlocked)
    {
        if (frameCounter >= 30)
        {
            stepSound.play();
            frameCounter = 0;
            sproutState = (sproutState + 1) % (*newDirection).size();
            sprite.setTexture((*newDirection)[sproutState]);
        }
    }
    else
    {
        if (frameCounter >= 100)
        {
            frameCounter = 0;
            sproutState = (sproutState + 1) % textures_stand.size();
        }
        sprite.setTexture(textures_stand[sproutState]);
    }
}

std::vector<sf::Texture> Player::add_sprites(std::string pos)
{
    // Load sprites of different directions
    std::vector<sf::Texture> textures;
    for (int i = 0; i < 2; ++i)
    {
        sf::Texture newTexture;
        if (!newTexture.loadFromFile("assets/img/sprites/" + pos + std::to_string(i + 1) + ".png"))
        {
            std::cerr << "Failed to load img/sprites/" << pos << std::to_string(i + 1) << ".png" << std::endl;
        }
        textures.push_back(newTexture);
    }
    return textures;
}

sf::Vector2f Player::getPosition()
{
    return sprite.getPosition();
}

sf::Texture Player::getAttackTexture()
{
    return attackTexture;
}

void Player::attack()
{
    sprite.setTexture(attackTexture);
}