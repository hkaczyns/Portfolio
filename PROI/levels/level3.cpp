/**
 * Name: level3.cpp
 * Purpose: class representing level 3 (with the princess frog)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "level3.h"
#include "../quests/crystalquest.h"
#include "../quests/kissquest.h"
#include <iostream>
#include <codecvt>
#include <locale>

Level3::Level3(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats) : MapExplore(userwindow, clock, manager, stats) {}

void Level3::loadScenery()
{
    // Load background texture
    background.init("assets/img/backgrounds/frog_bckg.png", sf::Vector2f(0, 0), 2000);

    interactiveScenery.push_back(std::make_unique<InteractiveElement>("assets/img/npc/princess_frog.png", sf::Vector2f(933.0f, 799.0f), 70));
    interactiveScenery.push_back(std::make_unique<InteractiveElement>("assets/img/others/invisible.png", sf::Vector2f(881.0f, 50.0f), 70));
}

void Level3::customUpdate()
{
    // complete PRINCESS quest if the princess is found
    if (interactiveScenery[0]->isVisitedBy(player) && playerStats.isQuestInList(QuestID::PRINCESS) && !playerStats.isQuestCompleted(QuestID::PRINCESS))
    {
        playerStats.completeQuest(QuestID::PRINCESS, questNotification);
        playerStats.addQuest(std::make_shared<KissQuest>());
        questNotification.setMessage(L"Pocałuj żabę!");
        questNotification.show();
    }

    // complete KISS quest if the princess is kissed
    if (interactiveScenery[0]->isInteractedWith(player) && playerStats.isQuestCompleted(QuestID::PRINCESS) && playerStats.isQuestInList(QuestID::KISS) && !playerStats.isQuestCompleted(QuestID::KISS))
    {
        playerStats.completeQuest(QuestID::KISS, questNotification);
        manager.changeScene(SceneID::Cutscene3_1, window, clock, playerStats);
        return;
    }

    // return to level 1 if the exit invisible door is interacted with
    if (interactiveScenery[1]->isInteractedWith(player))
    {
        manager.changeScene(SceneID::Level1, window, clock, playerStats);
        return;
    }

    for (auto &element : interactiveScenery)
    {
        if (element->isInteractedWith(player))
        {
            element->interact(playerStats);
        }
    }
}
