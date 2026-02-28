/**
 * Name: cutscene3_1.cpp
 * Purpose: class representing the third cutscene (with the princess)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "cutscene3_1.h"

Cutscene3_1::Cutscene3_1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats)
    : CutsceneScene(userwindow, clock, manager, stats, "assets/audio/music/medieval.wav", "assets/audio/voiceovers/cutscene3_princess.wav", SceneID::EndMenu) {}

void Cutscene3_1::init()
{
    CutsceneScene::init();

    // add background
    frames.push_back(CutsceneFrame("assets/img/cutscenes/3_princess/princessscene1.png", 9));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/3_princess/princessscene2.png", 12));

    // add subtitles
    timedText.push_back({sf::String(L"Bohaterze!"), 1});
    timedText.push_back({sf::String(L"Ile dni czekałam tu na ratunek?!"), 3});
    timedText.push_back({sf::String(L"W końcu przybyłeś! Wdzięcznam tobie!"), 5});
    timedText.push_back({sf::String(L"Weź mą dłoń i stańmy wspólnie na ślubnym kobiercu!"), 6});
    timedText.push_back({sf::String(L"A Dobrogród niech żyje długo i szczęśliwie!"), 6});
}
