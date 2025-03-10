/**
 * Name: interactiveelement_adversary.h
 * Purpose: class representing an interactive element that is also a possible adversary
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "interactiveelement.h"
#include "objectids.h"

class AdversaryNPCElement : public InteractiveElement
{
private:
    GameObjectID id{GameObjectID::NONE};

public:
    AdversaryNPCElement(const std::string &texturePath, const sf::Vector2f &position, const int width, GameObjectID id = GameObjectID::NONE);
    void interact(PlayerStats &playerStats) override;
    GameObjectID getID() const { return id; };
};