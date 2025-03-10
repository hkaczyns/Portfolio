/**
 * Name: level3.h
 * Purpose: class representing level 3 (with the princess frog)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/mapexplore.h"
#include "../scenes/scenemanager.h"

class Level3 : public MapExplore
{

public:
    Level3(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void loadScenery() override;
    void customUpdate() override;
};