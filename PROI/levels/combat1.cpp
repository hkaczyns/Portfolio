/**
 * Name: combat1.cpp
 * Purpose: class representing a combat encounter
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "combat1.h"
#include <iostream>
#include "../sceneelems/combatnpc.h"

Combat1::Combat1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats) : FightScene(userwindow, clock, manager, stats) {}

void Combat1::loadScenery()
{
    // Load background texture
    background.init("assets/img/backgrounds/background_combat1.png", sf::Vector2f(0, 0), 1920);

    // load a specific combat npc for each combat instance
    if (!playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_1))
    {
        combatants.push_back(CombatNPC("assets/img/npc/npc1_down1.png", sf::Vector2f(1500.0f, 400.0f), 70, CombatInteractionType::KILLABLE, 20, 5, "npc1", GameObjectID::ROBIN_STINK_COMBATANT_1));
    }
    else if (!playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_2))
    {
        combatants.push_back(CombatNPC("assets/img/npc/npc1_down1.png", sf::Vector2f(1500.0f, 400.0f), 70, CombatInteractionType::KILLABLE, 20, 5, "npc1", GameObjectID::ROBIN_STINK_COMBATANT_2));
    }
    else if (!playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_3))
    {
        combatants.push_back(CombatNPC("assets/img/npc/npc1_down1.png", sf::Vector2f(1500.0f, 400.0f), 70, CombatInteractionType::KILLABLE, 20, 5, "npc1", GameObjectID::ROBIN_STINK_COMBATANT_3));
    }
    else if (!playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_4))
    {
        combatants.push_back(CombatNPC("assets/img/npc/npc1_down1.png", sf::Vector2f(1500.0f, 400.0f), 70, CombatInteractionType::KILLABLE, 20, 5, "npc1", GameObjectID::ROBIN_STINK_COMBATANT_4));
    }
    else if (!playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK))
    {
        combatants.push_back(CombatNPC("assets/img/npc/npc2_down1.png", sf::Vector2f(1500.0f, 400.0f), 70, CombatInteractionType::KILLABLE, 50, 10, "npc2", GameObjectID::ROBIN_STINK));
    }
}

void Combat1::customUpdate()
{
}
