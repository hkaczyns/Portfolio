/**
 * Name: interactiveelement_pickup.h
 * Purpose: class representing an interactive element which can be picked up
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "interactiveelement.h"
#include "objectids.h"

class PickupElement : public InteractiveElement
{
private:
    std::shared_ptr<PickupObject> item;
    GameObjectID id{GameObjectID::NONE};

public:
    PickupElement(const std::string &texturePath, const sf::Vector2f &position, const int width, std::shared_ptr<PickupObject> item, GameObjectID id = GameObjectID::NONE);
    void interact(PlayerStats &playerStats) override;
    GameObjectID getID() const { return id; };
};