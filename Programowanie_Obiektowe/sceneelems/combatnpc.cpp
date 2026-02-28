/**
 * Name: combatnpc.cpp
 * Purpose: class representing an enemy in combat and allows fighting interaction
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "combatnpc.h"
#include "../mechanics/playerstats.h"
#include <iostream>
#include "player.h"
#include <cmath>

CombatNPC::CombatNPC() : SceneryElement() {}

CombatNPC::CombatNPC(const std::string &texturePath, const sf::Vector2f &position, const int width, CombatInteractionType type, int health, int strength, std::string name, GameObjectID id) : type(type), health(health), strength(strength), name(name), id(id)
{
    init(texturePath, position, width);
    sf::Texture newTexture;
    newTexture.loadFromFile("assets/img/npc/" + name + "_down1.png");
    textures.push_back(newTexture);
    newTexture.loadFromFile("assets/img/npc/" + name + "_down2.png");
    textures.push_back(newTexture);
    newTexture.loadFromFile("assets/img/npc/" + name + "_attack.png");
    textures.push_back(newTexture);

    // Add sound of attack
    static sf::SoundBuffer attackSoundBuffer;
    if (!attackSoundBuffer.loadFromFile("assets/audio/music/inventory_open.wav"))
    {
        std::cerr << "Error: sound" << std::endl;
        return;
    }

    attackSound.setBuffer(attackSoundBuffer);
    attackSound.setVolume(30);
    // Add sound of hit
    static sf::SoundBuffer hitSoundBuffer;
    if (!hitSoundBuffer.loadFromFile("assets/audio/sound_effects/combatant_hit/4.wav"))
    {
        std::cerr << "Error: sound" << std::endl;
        return;
    }

    hitSound.setBuffer(hitSoundBuffer);
    hitSound.setVolume(30);
}

bool CombatNPC::isVisitedBy(SceneryElement &elem)
{
    return (elem.getX() > (getX() - getWidth() * 0.5f) && elem.getX() < (getX() + getWidth() * 1.0f) && elem.getY() > (getY() - getHeight() * 0.5f) && elem.getY() < (getY() + getHeight() * 1.0f));
}

bool CombatNPC::isAttacked(Player &elem)
{
    if (type == KILLABLE && isVisitedBy(elem) && sf::Keyboard::isKeyPressed(sf::Keyboard::C))
    {
        elem.attack();
        attackSound.play();
        sf::Vector2f playerPos = elem.getPosition();
        sf::Vector2f npcPos = sprite.getPosition();

        sf::Vector2f direction = npcPos - playerPos;

        // Calculate the distance to the player
        float distance = sqrt(direction.x * direction.x + direction.y * direction.y);

        const float epsilon = 0.001f;

        if (distance < epsilon)
        {
            // If distance is too small, set a default direction
            direction = sf::Vector2f(0.0f, -1.0f);
        }
        else
        {
            // Normalize the direction vector
            direction /= distance;
        }

        float knockbackDistance = 200.0f;

        // Calculate the new position based on the knockback distance
        sf::Vector2f newPosition = npcPos + direction * knockbackDistance;

        sprite.setPosition(newPosition);
        return true;
    }
    else
        return false;
}

bool CombatNPC::isDefeated()
{
    if (health <= 0 && type == KILLABLE)
        return true;
    else
        return false;
    return (health <= 0 && type == KILLABLE);
}

void CombatNPC::receiveDamage(PlayerStats playerStats)
{
    hitSound.play();
    health -= playerStats.getStrength();
}

void CombatNPC::approach(Player player)
{
    sf::Vector2f playerPos = player.getPosition();
    sf::Vector2f npcPos = sprite.getPosition();

    sf::Vector2f direction = playerPos - npcPos;

    // Calculate the distance to the player
    float distance = sqrt(direction.x * direction.x + direction.y * direction.y);

    if (distance > 0)
    {
        // Normalize the direction vector
        direction /= distance;

        float npcSpeed = 2.5f;

        sf::Vector2f movement = direction * npcSpeed;

        sprite.move(movement);
    }
}

void CombatNPC::attack(PlayerStats &playerStats)
{
    hitSound.play();
    playerStats.setHealth(playerStats.getHealth() - strength);
    sprite.setTexture(textures[2]);
}

int CombatNPC::getHealth()
{
    return health;
}

void CombatNPC::walk()
{
    if (pose == 1)
    {
        sprite.setTexture(textures[1]);
        pose = 0;
    }
    else
    {
        pose = 1;
        sprite.setTexture(textures[0]);
    }
}

GameObjectID CombatNPC::getId()
{
    return id;
}