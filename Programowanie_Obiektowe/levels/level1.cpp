/**
 * Name: level1.cpp
 * Purpose: class representing level 1 (the main town)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "level1.h"
#include "../sceneelems/interactiveelement_pickup.h"
#include "../quests/crystalquest.h"
#include "../quests/towncrierquest.h"
#include "../quests/robinstinkquest.h"
#include <iostream>
#include <codecvt>
#include <locale>

Level1::Level1(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats) : MapExplore(userwindow, clock, manager, stats) {}

void Level1::loadScenery()
{
    // Load background texture
    background.init("assets/img/backgrounds/background_level1.png", sf::Vector2f(0, 0), 10421);

    // load the town crier
    interactiveScenery.push_back(std::make_unique<InteractiveElement>("assets/img/npc/npc1_friendly_down1.png", sf::Vector2f(3417.0f, 2485.0f), 70));

    // load the invisible doors
    interactiveScenery.push_back(std::make_unique<InteractiveElement>("assets/img/others/invisible.png", sf::Vector2f(10300.0f, 6300.0f), 70));
    interactiveScenery.push_back(std::make_unique<InteractiveElement>("assets/img/others/invisible.png", sf::Vector2f(9860.0f, 2000.0f), 70));

    // load pickup items
    addPickUp("assets/img/objects/crystals/Yellow-green_crystal3.png", sf::Vector2f(1900.0f, 400.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL1);
    addPickUp("assets/img/objects/crystals/Blue_crystal1.png", sf::Vector2f(1000.0f, 2485.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL2);
    addPickUp("assets/img/objects/crystals/Pink_crystal1.png", sf::Vector2f(2153.0f, 4545.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL3);
    addPickUp("assets/img/objects/crystals/Yellow-green_crystal3.png", sf::Vector2f(2113.0f, 5905.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL7);
    addPickUp("assets/img/objects/crystals/Blue_crystal1.png", sf::Vector2f(9617.0f, 6449.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL8);
    addPickUp("assets/img/objects/crystals/Yellow-green_crystal3.png", sf::Vector2f(809.0f, 4881.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL9);
    addPickUp("assets/img/objects/crystals/Pink_crystal1.png", sf::Vector2f(9657.0f, 2425.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL10);
    addPickUp("assets/img/objects/food/bread.png", sf::Vector2f(1905.0f, 935.0f), 70, std::make_shared<Bread>(), GameObjectID::BREAD1);

    // load blockades
    addBlockade(2300, 320, sf::Vector2f(0, 0));
    addBlockade(1550, 1650, sf::Vector2f(0, 704));
    addBlockade(2393, 2330, sf::Vector2f(1967, 0));
    addBlockade(4300, 1200, sf::Vector2f(0, 3040));
    addBlockade(640, 125, sf::Vector2f(2092, 2369));
    addBlockade(834, 125, sf::Vector2f(2002, 2787));
    addBlockade(320, 90, sf::Vector2f(3282, 2406));
    addBlockade(320, 3000, sf::Vector2f(0, 4100));
    addBlockade(10420, 390, sf::Vector2f(0, 6980));
    addBlockade(850, 665, sf::Vector2f(4215, 0));
    addBlockade(5384, 1969, sf::Vector2f(5035, 0));
    addBlockade(4705, 377, sf::Vector2f(4927, 1939));
    addBlockade(340, 4241, sf::Vector2f(10093, 1941));
    addBlockade(4373, 1217, sf::Vector2f(4921, 3053));
    addBlockade(4385, 1265, sf::Vector2f(4917, 4821));
    addBlockade(261, 281, sf::Vector2f(1979, 5315));

    // function below is used for testing to show where the blockades are placed inside the game
    // showBlockades();

    // add the first quest
    if (!playerStats.isQuestInList(QuestID::TOWN_CRIER))
    {
        playerStats.addQuest(std::make_shared<TownCrierQuest>());

        questNotification.setMessage(L"Znajdź wieszcza");
        questNotification.show();
    }
}

void Level1::customUpdate()
{
    // begin the crystal quest if the player picks up his first crystal
    if (playerStats.getItemQuantity(PickupCategory::CRYSTAL) >= 1 && !playerStats.isQuestInList(QuestID::CRYSTAL_HUNTING))
    {
        playerStats.addQuest(std::make_shared<CrystalHuntingQuest>());
        questNotification.setMessage(L"Zbierz kryształy");
        questNotification.show();
    }

    // complete the town crier quest if the player visits him
    if (interactiveScenery[0]->isVisitedBy(player) && !playerStats.isQuestCompleted(QuestID::TOWN_CRIER))
    {
        playerStats.completeQuest(QuestID::TOWN_CRIER, questNotification);
    }

    // begin the first cutscene if the player interacts with the town crier
    if (interactiveScenery[0]->isInteractedWith(player) && playerStats.isQuestInList(QuestID::TOWN_CRIER) && !playerStats.isQuestInList(QuestID::ROBIN_STINK))
    {
        manager.changeScene(SceneID::Cutscene1, window, clock, playerStats);
        return;
    }

    // begin the second cutscene if the player returns the money from level2 to the town crier
    if (interactiveScenery[0]->isInteractedWith(player) && playerStats.isQuestInList(QuestID::MONEY_BAGS) && playerStats.isQuestCompleted(QuestID::MONEY_BAGS) && playerStats.isQuestInList(QuestID::GIVE_BACK_MONEY) && !playerStats.isQuestCompleted(QuestID::GIVE_BACK_MONEY))
    {
        playerStats.completeQuest(QuestID::GIVE_BACK_MONEY, questNotification);
        manager.changeScene(SceneID::Cutscene2, window, clock, playerStats);
        return;
    }

    // show quest notification for robin stink quest after recieving it
    if (playerStats.isQuestInList(QuestID::ROBIN_STINK) && !playerStats.getQuest(QuestID::ROBIN_STINK)->getWasSeen())
    {
        questNotification.setMessage(L"Zgładź Robina Smróda!");
        questNotification.show();
        playerStats.getQuest(QuestID::ROBIN_STINK)->setWasSeen(true);
    }

    // complete the givebackmoneyquest after the second cutscene
    if (playerStats.isQuestInList(QuestID::GIVE_BACK_MONEY) && playerStats.isQuestInList(QuestID::PRINCESS) && !playerStats.getQuest(QuestID::GIVE_BACK_MONEY)->getWasSeen())
    {
        if (!questNotification.isVisible())
        {
            playerStats.completeQuest(QuestID::GIVE_BACK_MONEY, questNotification);
            playerStats.getQuest(QuestID::GIVE_BACK_MONEY)->setWasSeen(true);
        }
    }

    // show notification for the princess quest after the second cutscene
    if (playerStats.isQuestInList(QuestID::PRINCESS) && !playerStats.getQuest(QuestID::PRINCESS)->getWasSeen())
    {
        if (!questNotification.isVisible())
        {
            questNotification.setHeader(L"Nowe zadanie!");
            questNotification.setMessage(L"Znajdź księżniczkę!");
            questNotification.show();
            playerStats.getQuest(QuestID::PRINCESS)->setWasSeen(true);
        }
    }

    // move to level2 after interaction with the invisible door
    if (interactiveScenery[1]->isInteractedWith(player, 50.f) && playerStats.isQuestInList(QuestID::ROBIN_STINK))
    {
        manager.changeScene(SceneID::Level2, window, clock, playerStats);
        return;
    }

    // move to level 3 after interaction with the invisible door
    if (interactiveScenery[2]->isInteractedWith(player, 50.f) && playerStats.isQuestInList(QuestID::PRINCESS))
    {
        manager.changeScene(SceneID::Level3, window, clock, playerStats);
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
