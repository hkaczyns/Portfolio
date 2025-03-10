/**
 * Name: level2.cpp
 * Purpose: class representing level 2 (Robin Stink lair)
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "level2.h"
#include "../sceneelems/interactiveelement_pickup.h"
#include "../quests/crystalquest.h"
#include "../quests/towncrierquest.h"
#include "../quests/robinstinkquest.h"
#include "../quests/moneybagsquest.h"
#include <iostream>

Level2::Level2(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats) : MapExplore(userwindow, clock, manager, stats) {}

void Level2::loadScenery()
{
    // Load background texture
    background.init("assets/img/backgrounds/background_level2.png", sf::Vector2f(0, 0), 4000);

    // load the invisible exit door
    interactiveScenery.push_back(std::make_unique<InteractiveElement>("assets/img/others/invisible.png", sf::Vector2f(75.0f, 500.0f), 70));

    // load adversaries
    addAdversaryNPC("assets/img/npc/npc1_right1.png", sf::Vector2f(3600.0f, 700.0f), 70, GameObjectID::ROBIN_STINK_COMBATANT_1, "assets/img/npc/npc1_dead.png");
    addAdversaryNPC("assets/img/npc/npc1_right1.png", sf::Vector2f(3600.0f, 1200.0f), 70, GameObjectID::ROBIN_STINK_COMBATANT_2, "assets/img/npc/npc1_dead.png");
    addAdversaryNPC("assets/img/npc/npc1_right1.png", sf::Vector2f(2800.0f, 2000.0f), 70, GameObjectID::ROBIN_STINK_COMBATANT_3, "assets/img/npc/npc1_dead.png");
    addAdversaryNPC("assets/img/npc/npc1_right1.png", sf::Vector2f(2800.0f, 2541.0f), 70, GameObjectID::ROBIN_STINK_COMBATANT_4, "assets/img/npc/npc1_dead.png");
    addAdversaryNPC("assets/img/npc/npc2_right1.png", sf::Vector2f(2500.0f, 3000.0f), 70, GameObjectID::ROBIN_STINK, "assets/img/npc/npc2_dead.png");

    // load crystals connected with the crystal hunt quest
    addPickUp("assets/img/objects/crystals/Yellow-green_crystal3.png", sf::Vector2f(2000.0f, 1800.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL4);
    addPickUp("assets/img/objects/crystals/Blue_crystal1.png", sf::Vector2f(3800.0f, 3500.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL5);
    addPickUp("assets/img/objects/crystals/Pink_crystal1.png", sf::Vector2f(1000.0f, 3500.0f), 70, std::make_shared<Crystal>(), GameObjectID::CRYSTAL6);

    // load money bags after Robin Stink has been defeated
    addMoneyBags();

    // load blockades
    addBlockade(4000, 378, sf::Vector2f(0, 0));
    addBlockade(3363, 961, sf::Vector2f(0, 640));
    addBlockade(2600, 617, sf::Vector2f(0, 2029));
    addBlockade(887, 605, sf::Vector2f(3117, 2049));
    addBlockade(119, 901, sf::Vector2f(3885, 629));
    addBlockade(4000, 195, sf::Vector2f(0, 3809));

    // function below is used for testing to show where the blockades are placed inside the game
    // showBlockades();
}

void Level2::customUpdate()
{
    // check whether the player is dead
    if (playerStats.getHealth() <= 0)
    {
        playerStats.setHealth(100);
        player.setPosition(window.getSize().x / 2.0f, window.getSize().y / 2.0f);
        questNotification.setHeader(L"Zostałeś pokonany!");
        questNotification.setMessage(L"Nie martw się - spróbuj ponownie!");
        questNotification.show();
    }

    // return to level 1 if the player interacts with the invisible door
    if (interactiveScenery[0]->isInteractedWith(player))
    {
        manager.changeScene(SceneID::Level1, window, clock, playerStats);
        return;
    }

    // begin combat if the player moves into the proximity of adversary1
    if (interactiveScenery[1]->isVisitedBy(player, 215.0f) && playerStats.isQuestInList(QuestID::ROBIN_STINK) && !playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_1))
    {
        manager.changeScene(SceneID::combat1, window, clock, playerStats);
        return;
    }

    // begin combat if the player moves into the proximity of adversary2
    if (interactiveScenery[2]->isVisitedBy(player, 215.0f) && playerStats.isQuestInList(QuestID::ROBIN_STINK) && !playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_2))
    {
        manager.changeScene(SceneID::combat1, window, clock, playerStats);
        return;
    }

    // begin combat if the player moves into the proximity of adversary3
    if (interactiveScenery[3]->isVisitedBy(player, 215.0f) && playerStats.isQuestInList(QuestID::ROBIN_STINK) && !playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_3))
    {
        manager.changeScene(SceneID::combat1, window, clock, playerStats);
        return;
    }

    // begin combat if the player moves into the proximity of adversary4
    if (interactiveScenery[4]->isVisitedBy(player, 215.0f) && playerStats.isQuestInList(QuestID::ROBIN_STINK) && !playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_4))
    {
        manager.changeScene(SceneID::combat1, window, clock, playerStats);
        return;
    }

    // begin combat if the player moves into the proximity of Robin Stink
    if (interactiveScenery[5]->isVisitedBy(player, 215.0f) && playerStats.isQuestInList(QuestID::ROBIN_STINK) && !playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK))
    {
        manager.changeScene(SceneID::combat1, window, clock, playerStats);
        return;
    }

    // recieve the crystal quest if the player picks up his first crystal
    if (playerStats.getItemQuantity(PickupCategory::CRYSTAL) >= 1 && !playerStats.isQuestInList(QuestID::CRYSTAL_HUNTING))
    {
        playerStats.addQuest(std::make_shared<CrystalHuntingQuest>());
        questNotification.setMessage(L"Zbierz kryształy");
        questNotification.show();
    }

    // complete the Robin Stink quest if all adversaries have been defeated
    if (playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_1) && playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_2) && playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_3) && playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK_COMBATANT_4) && playerStats.hasAdversaryBeenDefeated(GameObjectID::ROBIN_STINK))
    {
        if (playerStats.isQuestInList(QuestID::ROBIN_STINK) && !playerStats.isQuestCompleted(QuestID::ROBIN_STINK))
        {
            playerStats.completeQuest(QuestID::ROBIN_STINK, questNotification);
            addMoneyBags();
        }
    }

    // begin moneybag quest if Robin Stink quest has been completed
    if (playerStats.isQuestInList(QuestID::ROBIN_STINK) && playerStats.isQuestCompleted(QuestID::ROBIN_STINK) && !playerStats.isQuestInList(QuestID::MONEY_BAGS))
    {
        if (!questNotification.isVisible())
        {
            playerStats.addQuest(std::make_shared<MoneyBagsQuest>());
            questNotification.setHeader(L"Nowe zadanie!");
            questNotification.setMessage(L"Znajdź sakwy z pieniędzmi!");
            questNotification.show();
        }
    }

    // begin givebackmoney quest if all bags have been collected
    if (playerStats.isQuestInList(QuestID::MONEY_BAGS) && playerStats.isQuestCompleted(QuestID::MONEY_BAGS) && !playerStats.isQuestInList(QuestID::GIVE_BACK_MONEY))
    {
        if (!playerStats.isQuestInList(QuestID::GIVE_BACK_MONEY))
        {
            playerStats.addQuest(std::make_shared<GiveBackMoneyQuest>());
        }
    }

    // show givebackmoney quest notification
    if (playerStats.isQuestInList(QuestID::GIVE_BACK_MONEY) && !playerStats.getQuest(QuestID::GIVE_BACK_MONEY)->getWasSeen())
    {
        if (!questNotification.isVisible())
        {
            questNotification.setHeader(L"Nowe zadanie!");
            questNotification.setMessage(L"Zwróć skradzione pieniądze wieszczowi.");
            questNotification.show();
            playerStats.getQuest(QuestID::GIVE_BACK_MONEY)->setWasSeen(true);
        }
    }

    for (auto &element : interactiveScenery)
    {
        if (element->isInteractedWith(player))
        {
            element->interact(playerStats);
        }
    }
}

void Level2::addMoneyBags()
{
    if (playerStats.isQuestCompleted(QuestID::ROBIN_STINK))
    {
        addPickUp("assets/img/objects/forest/coin_sack.png", sf::Vector2f(1500.0f, 3100.0f), 70, std::make_shared<MoneyBag>(), GameObjectID::MONEY_BAG_1);
        addPickUp("assets/img/objects/forest/coin_sack.png", sf::Vector2f(405.0f, 1785.0f), 70, std::make_shared<MoneyBag>(), GameObjectID::MONEY_BAG_2);
        addPickUp("assets/img/objects/forest/coin_sack.png", sf::Vector2f(3785.0f, 540.0f), 70, std::make_shared<MoneyBag>(), GameObjectID::MONEY_BAG_3);
        addPickUp("assets/img/objects/forest/coin_sack.png", sf::Vector2f(2900.0f, 3500.0f), 70, std::make_shared<MoneyBag>(), GameObjectID::MONEY_BAG_4);
        addPickUp("assets/img/objects/forest/coin_sack.png", sf::Vector2f(3945.0f, 1800.0f), 70, std::make_shared<MoneyBag>(), GameObjectID::MONEY_BAG_5);
    }
}