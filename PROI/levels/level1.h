/**
 * Name: level1.h
 * Purpose: class representing level 1 (the main town)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/mapexplore.h"
#include "../scenes/scenemanager.h"

class Level1 : public MapExplore
{

public:
    Level1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void loadScenery() override;
    void customUpdate() override;
};