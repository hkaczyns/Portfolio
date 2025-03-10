/**
 * Name: combat1.h
 * Purpose: class representing a combat encounter
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/fightscene.h"

class Combat1 : public FightScene
{
public:
    Combat1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void loadScenery() override;
    void customUpdate() override;
};