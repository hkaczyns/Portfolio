/**
 * Name: sceneryelement.cpp
 * Purpose: class representing all elements of the scenery
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "sceneryelement.h"
#include <iostream>

SceneryElement::SceneryElement() {}

SceneryElement::~SceneryElement() {}

SceneryElement::SceneryElement(const std::string &texturePath, const sf::Vector2f &position, const int width)
{
    init(texturePath, position, width);
}

void SceneryElement::init(const std::string &texturePath, const sf::Vector2f &position, const int width)
{
    if (!texture)
    {
        texture = std::make_shared<sf::Texture>();
        if (!texture->loadFromFile(texturePath))
        {
            throw std::runtime_error("Failed to load texture: " + texturePath);
        }
    }
    sprite.setTexture(*texture);
    sprite.setPosition(position);
    sprite.setScale(width / sprite.getGlobalBounds().width, width / sprite.getGlobalBounds().width);
}

// Getters
float SceneryElement::getX() const
{
    return sprite.getPosition().x;
}

float SceneryElement::getY() const
{
    return sprite.getPosition().y;
}

float SceneryElement::getWidth() const
{
    return sprite.getGlobalBounds().width;
}

float SceneryElement::getHeight() const
{
    return sprite.getGlobalBounds().height;
}

sf::Sprite &SceneryElement::getSprite()
{
    return sprite;
}

void SceneryElement::setPosition(float x, float y)
{
    sprite.setPosition(x, y);
}

void SceneryElement::setX(float x)
{
    sprite.setPosition(x, getY());
}

void SceneryElement::setY(float y)
{
    sprite.setPosition(getX(), y);
}

void SceneryElement::setScale(float width)
{
    float currentWidth = getWidth();
    if (currentWidth != 0)
    {
        sprite.setScale(width / currentWidth, width / currentWidth);
    }
}