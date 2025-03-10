/**
 * Name: cutscene1_2.cpp
 * Purpose: class representing the second cutscene (returning money to the town crier)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "cutscene1_2.h"

Cutscene1_2::Cutscene1_2(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats)
    : CutsceneScene(userwindow, clock, manager, stats, "assets/audio/music/medieval.wav", "assets/audio/voiceovers/cutscene2_orator.wav", SceneID::Level1) {}

void Cutscene1_2::init()
{
    CutsceneScene::init();

    // add background
    frames.push_back(CutsceneFrame("assets/img/cutscenes/2_orator/oratorscene2_1.png", 2));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/2_orator/oratorscene2_2.png", 3));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/2_orator/oratorscene2_3.png", 6));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/2_orator/oratorscene2_4.png", 5));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/2_orator/oratorscene2_5.png", 6));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/2_orator/oratorscene2_6.png", 5));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/2_orator/oratorscene2_7.png", 10));

    // add subtitles
    timedText.push_back({sf::String(L"Bohaterze!"), 2});
    timedText.push_back({sf::String(L"Pomogłeś naszej społeczności."), 3});
    timedText.push_back({sf::String(L"Masz za to wieczny dług wdzięczności Dobrogrodu!"), 6});
    timedText.push_back({sf::String(L"Jest jednak jeszcze jeden szkopuł."), 5});
    timedText.push_back({sf::String(L"Mam informację, gdzie może znajdować się księżniczka,"), 6});
    timedText.push_back({sf::String(L"jednak nikt nie ma odwagi pójść tam samemu."), 5});
    timedText.push_back({sf::String(L"Ruszaj do lasu na północny zachód, albo Dobrogród będzie stracony!"), 10});

    playerStats.addQuest(std::make_shared<PrincessQuest>());
}
