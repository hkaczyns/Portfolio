/**
 * Name: cutscene1_1.h
 * Purpose: class representing the first cutscene (town crier tasks to kill Robin Stink)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/cutscenescene.h"
#include "../quests/robinstinkquest.h"

class Cutscene1_1 : public CutsceneScene
{
public:
    Cutscene1_1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
};