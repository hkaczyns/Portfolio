/**
 * Name: inventoryitem.h
 * Purpose: class representing an inventory item
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once

#include <string>
#include <memory>
#include "pickupobject.h"

class InventoryItem
{
public:
    std::shared_ptr<PickupObject> item;
    int quantity;
    InventoryItem(std::shared_ptr<PickupObject> item, int quantity) : item(item), quantity(quantity){};

    std::string getAssetPath() const;
    sf::String getName() const;
    std::string getDescription() const;
    sf::String getLDescription() const;
    int getQuantity() const;
};