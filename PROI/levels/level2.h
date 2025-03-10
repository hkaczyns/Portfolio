/**
 * Name: level2.h
 * Purpose: class representing level 2 (Robin Stink lair)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/mapexplore.h"
#include "../scenes/scenemanager.h"

class Level2 : public MapExplore
{
private:
    void addMoneyBags();
public:
    Level2(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void loadScenery() override;
    void customUpdate() override;
};