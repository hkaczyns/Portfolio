/**
 * Name: interactiveelement_adversary.cpp
 * Purpose: class representing an interactive element that is also a possible adversary
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "interactiveelement_adversary.h"

AdversaryNPCElement::AdversaryNPCElement(const std::string &texturePath, const sf::Vector2f &position, const int width, GameObjectID id)
    : InteractiveElement(texturePath, position, width), id(id) {}

void AdversaryNPCElement::interact(PlayerStats &playerStats)
{
}