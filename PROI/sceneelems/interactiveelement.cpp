/**
 * Name: interactiveelement.cpp
 * Purpose: class representing an element which allows interaction with the player
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "interactiveelement.h"
#include <iostream>

InteractiveElement::InteractiveElement() : SceneryElement() {}

InteractiveElement::InteractiveElement(const std::string &texturePath, const sf::Vector2f &position, const int width)
{
    init(texturePath, position, width);

    if (!promptTexture.loadFromFile("assets/img/ui/click_e.png"))
    {
        std::cerr << "Failed to load prompt image!" << std::endl;
    }
    promptSprite.setTexture(promptTexture);
    promptSprite.setPosition(position.x - 25, position.y - 30);
    promptSprite.setScale(0.6f, 0.6f);
    promptSprite.setColor(sf::Color(255, 255, 255, 0));
}

bool InteractiveElement::isVisitedBy(SceneryElement &elem, float margin)
{
    return (active &&
            elem.getX() + elem.getWidth() > (getX() - getWidth() * 0.5f - margin) &&
            elem.getX() < (getX() + getWidth() * 1.5f + margin) &&
            elem.getY() + elem.getHeight() > (getY() - getHeight() * 0.5f) &&
            elem.getY() < (getY() + getHeight() * 1.5f));
}

bool InteractiveElement::isInteractedWith(SceneryElement &elem, float margin)
{
    return active && isVisitedBy(elem, margin) && sf::Keyboard::isKeyPressed(sf::Keyboard::E);
}

void InteractiveElement::deactivate()
{
    active = false;
}

void InteractiveElement::hide()
{
    // Make the element disappear
    sprite.setColor(sf::Color(0, 0, 0, 0));
}

void InteractiveElement::interact(PlayerStats &playerStats)
{
}

void InteractiveElement::updatePrompt(SceneryElement &player)
{
    if (isVisitedBy(player))
    {
        promptVisible = true;
        promptOpacity = std::min(promptOpacity + 15, 160.0f);
    }
    else
    {
        promptVisible = false;
        promptOpacity = std::max(promptOpacity - 15, 0.0f);
    }
    promptSprite.setColor(sf::Color(255, 255, 255, static_cast<sf::Uint8>(promptOpacity)));
}

sf::Sprite &InteractiveElement::getPromptSprite()
{
    return promptSprite;
}