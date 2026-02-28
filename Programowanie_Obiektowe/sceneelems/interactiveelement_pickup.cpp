/**
 * Name: interactiveelement_pickup.cpp
 * Purpose: class representing an interactive element which can be picked up
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "interactiveelement_pickup.h"

PickupElement::PickupElement(const std::string &texturePath, const sf::Vector2f &position, const int width, std::shared_ptr<PickupObject> item, GameObjectID id)
    : InteractiveElement(texturePath, position, width), item(item), id(id) {}

void PickupElement::interact(PlayerStats &playerStats)
{
    deactivate();
    hide();
    if (playerStats.hasItemBeenPickedUp(id))
    {
        return;
    }
    playerStats.pickUpItem(item);
    if (id != GameObjectID::NONE)
    {
        playerStats.markItemAsPickedUp(id);
    }
}