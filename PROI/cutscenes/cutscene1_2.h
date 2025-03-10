/**
 * Name: cutscene1_2.h
 * Purpose: class representing the second cutscene (returning money to the town crier)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "../scenes/cutscenescene.h"
#include "../quests/princessquest.h"

class Cutscene1_2 : public CutsceneScene
{
public:
    Cutscene1_2(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
};