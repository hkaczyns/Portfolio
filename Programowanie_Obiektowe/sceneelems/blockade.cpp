/**
 * Name: blockade.cpp
 * Purpose: class representing an invisible blockade that handles collision with the player
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "blockade.h"

Blockade::Blockade(float width, float height, float posX, float posY, sf::Color color)
{
    rectangle.setSize(sf::Vector2f(width, height));
    rectangle.setPosition(posX, posY);
    rectangle.setFillColor(color);
}

Blockade::~Blockade()
{
}

float Blockade::getX() const
{
    return rectangle.getPosition().x;
}

float Blockade::getY() const
{
    return rectangle.getPosition().y;
}

float Blockade::getWidth() const
{
    return rectangle.getSize().x;
}

float Blockade::getHeight() const
{
    return rectangle.getSize().y;
}

void Blockade::draw(sf::RenderWindow &window)
{
    window.draw(rectangle);
}

//show method used for testing to make blockades visible
void Blockade::show()
{
    rectangle.setFillColor(sf::Color(255, 0, 0, 100));
}