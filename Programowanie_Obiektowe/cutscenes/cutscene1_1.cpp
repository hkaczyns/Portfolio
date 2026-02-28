/**
 * Name: cutscene1_1.cpp
 * Purpose: class representing the first cutscene (town crier tasks to kill Robin Stink)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "cutscene1_1.h"

Cutscene1_1::Cutscene1_1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats)
    : CutsceneScene(userwindow, clock, manager, stats, "assets/audio/music/medieval.wav", "assets/audio/voiceovers/cutscene1_orator.wav", SceneID::Level1) {}

void Cutscene1_1::init()
{
    CutsceneScene::init();

    // add bakckground
    frames.push_back(CutsceneFrame("assets/img/cutscenes/1_orator/oratorscene_1_1.png", 4));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/1_orator/oratorscene_1_2.png", 10));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/1_orator/oratorscene_1_3.png", 11));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/1_orator/oratorscene_1_5.png", 4));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/1_orator/oratorscene_1_4.png", 12));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/1_orator/oratorscene_1_6.png", 11));
    frames.push_back(CutsceneFrame("assets/img/cutscenes/1_orator/oratorscene_1_7.png", 12));

    // add subtitles
    timedText.push_back({sf::String(L"Mieszkańcy Dobrogrodu!"), 4});
    timedText.push_back({sf::String(L"Mroczne chmury zebrały się nad naszym królestwem."), 5});
    timedText.push_back({sf::String(L"Wszechobecne ubóstwo krzywdzi wasze rodziny."), 5});
    timedText.push_back({sf::String(L"Na waszych ulicach panuje bezprawie, a księżniczka Dobrawa, symbol waszej nadziei, zaginęła."), 11});
    timedText.push_back({sf::String(L"Wszystko wydaje się być stracone!"), 4});
    timedText.push_back({sf::String(L"Czy nikt z was nie podejmie się próby walki z przeciwnościami losu??"), 7});
    timedText.push_back({sf::String(L"Czy nikt z was nie stanie się wybrańcem ludu??"), 5});
    timedText.push_back({sf::String(L"Obywatele, zbierzcie się na odwagę!"), 4});
    timedText.push_back({sf::String(L"Bandyci bezprawnie rozgościli się na wschodniej grani naszego królestwa!"), 7});
    timedText.push_back({sf::String(L"Wypędźcie bandę Robina Smróda z naszych ziem!"), 5});
    timedText.push_back({sf::String(L"Dobrogród będzie wam wdzięczny."), 7});

    playerStats.addQuest(std::make_shared<RobinStinkQuest>());
}
