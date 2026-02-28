/**
 * Name: combatnpc.h
 * Purpose: class representing an enemy in combat and allows fighting interaction
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include "sceneryelement.h"
#include "../mechanics/playerstats.h"
#include "player.h"

enum CombatInteractionType
{
    KILLABLE,
    UNKILLABLE
};

class CombatNPC : public SceneryElement
{
private:
    CombatInteractionType type;
    int health;
    int strength;
    std::string name;
    std::vector<sf::Texture> textures;
    int pose = 1;
    sf::Sound attackSound;
    sf::Sound hitSound;
    GameObjectID id;

public:
    CombatNPC();
    CombatNPC(const std::string &texturePath, const sf::Vector2f &position, const int width, CombatInteractionType type, int health, int strength, std::string name, GameObjectID id);
    bool isVisitedBy(SceneryElement &elem);
    bool isAttacked(Player &elem);
    bool isDefeated();
    void receiveDamage(PlayerStats playerStats);
    void approach(Player player);
    void attack(PlayerStats &playerStats);
    int getHealth();
    void walk();
    GameObjectID getId();
};
