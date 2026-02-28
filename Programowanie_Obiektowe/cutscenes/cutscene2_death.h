/**
 * Name: cutscene2_death.h
 * Purpose: class representing the death cutscene
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/cutscenescene.h"

class Cutscene2_Death : public CutsceneScene
{
public:
    Cutscene2_Death(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
};