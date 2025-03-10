/**
 * Name: cutscene2_death.cpp
 * Purpose: class representing the death cutscene
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "cutscene2_death.h"

Cutscene2_Death::Cutscene2_Death(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats)
    : CutsceneScene(userwindow, clock, manager, stats, "assets/audio/music/medieval.wav", "assets/audio/sound_effects/combatant_hit/4.wav", SceneID::Level2) {}

void Cutscene2_Death::init()
{
    CutsceneScene::init();

    // add background
    frames.push_back(CutsceneFrame("assets/img/cutscenes/deathscene/deathscene_1.png", 2));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/deathscene/deathscene_2.png", 2));

    // add subtitles
    timedText.push_back({sf::String(L"AAAAA!"), 1});
}
