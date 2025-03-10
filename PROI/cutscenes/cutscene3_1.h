/**
 * Name: cutscene3_1.h
 * Purpose: class representing the third cutscene (with the princess)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/cutscenescene.h"

class Cutscene3_1 : public CutsceneScene
{
public:
    Cutscene3_1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
};