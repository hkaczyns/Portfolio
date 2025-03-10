/**
 * Name: pickupobject.h
 * Purpose: class representing a pickup object in inventory
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <string>
#include <SFML/Graphics.hpp>

class PlayerStats;

// enum of all possible pickup objects
enum class PickupCategory
{
    MONEY_BAG,
    CRYSTAL,
    CARROT,
    BREAD
};

class PickupObject
{
protected:
    PickupCategory category;
    sf::String name;
    sf::String description;
    std::string assetPath;

public:
    PickupObject(PickupCategory category, sf::String name, sf::String description, std::string assetPath)
        : category(category), name(name), description(description), assetPath(assetPath) {}
    virtual ~PickupObject() {}
    PickupCategory getCategory() const { return category; };
    std::string getAssetPath() const { return assetPath; };
    sf::String getName() const { return name; };
    std::string getDescription() const { return description; };
    sf::String getLDescription() const { return description; };
};