/**
 * Name: inventoryitem.cpp
 * Purpose: class representing an inventory item
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "inventoryitem.h"

std::string InventoryItem::getAssetPath() const { return item->getAssetPath(); }
sf::String InventoryItem::getName() const { return item->getName(); }
std::string InventoryItem::getDescription() const { return item->getDescription(); }
sf::String InventoryItem::getLDescription() const { return item->getLDescription(); }
int InventoryItem::getQuantity() const { return quantity; }