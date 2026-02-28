/**
 * Name: scenemanager.cpp
 * Purpose: manages scene changes
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "scenemanager.h"
#include "../scenes/menuscene.h"          // Include MenuScene header
#include "../scenes/inventoryscene.h"     // Include InventoryScene header
#include "../scenes/questscene.h"         // Include QuestScene header
#include "../levels/level1.h"             // Include Level1 header
#include "../levels/level2.h"             // Include Level2 header
#include "../levels/combat1.h"            // Include Combat1 header
#include "../cutscenes/cutscene1_1.h"     // Include Cutscene1 header
#include "../cutscenes/cutscene1_2.h"     // Include Cutscene2 header
#include "../cutscenes/cutscene2_death.h" // Include Cutscene death header
#include "../cutscenes/cutscene3_1.h"     // Include Cutscene3 header
#include "../levels/level3.h"             // Include Level3 header
#include "../scenes/endmenu.h"            // Include EndMenu header

void SceneManager::changeScene(SceneID ID, sf::RenderWindow &window, sf::Clock &clock, PlayerStats &stats)
{

    prevSceneID = currentSceneID;
    currentSceneID = ID;

    switch (ID)
    {
    case SceneID::Start:
        break;
    case SceneID::MainMenu:
        currentScene = std::make_unique<MenuScene>(window, clock, *this, stats);
        break;
    case SceneID::Inventory:
        currentScene = std::make_unique<InventoryScene>(window, clock, *this, stats);
        break;
    case SceneID::Quests:
        currentScene = std::make_unique<QuestScene>(window, clock, *this, stats);
        break;
    case SceneID::Level1:
        currentScene = std::make_unique<Level1>(window, clock, *this, stats);
        break;
    case SceneID::Cutscene1:
        currentScene = std::make_unique<Cutscene1_1>(window, clock, *this, stats);
        break;
    case SceneID::Level2:
        currentScene = std::make_unique<Level2>(window, clock, *this, stats);
        break;
    case SceneID::combat1:
        currentScene = std::make_unique<Combat1>(window, clock, *this, stats);
        break;
    case SceneID::Cutscene_Death:
        currentScene = std::make_unique<Cutscene2_Death>(window, clock, *this, stats);
        break;
    case SceneID::Cutscene2:
        currentScene = std::make_unique<Cutscene1_2>(window, clock, *this, stats);
        break;
    case SceneID::Level3:
        currentScene = std::make_unique<Level3>(window, clock, *this, stats);
        break;
    case SceneID::Cutscene3_1:
        currentScene = std::make_unique<Cutscene3_1>(window, clock, *this, stats);
        break;
    case SceneID::EndMenu:
        currentScene = std::make_unique<EndMenuScene>(window, clock, *this, stats);
        break;
    }
    currentScene->init();
    currentScene->loadScenery();

    SceneChanged = true;
}

void SceneManager::goToPrevScene(sf::RenderWindow &window, sf::Clock &clock, PlayerStats &stats)
{
    changeScene(prevSceneID, window, clock, stats);
}

void SceneManager::handleInput(sf::Event event)
{
    if (currentScene && !SceneChanged)
    {
        currentScene->handleInput(event);
    }
}

void SceneManager::update()
{
    if (currentScene && !SceneChanged)
    {
        currentScene->update();
        currentScene->customUpdate();
    }
}

void SceneManager::render()
{
    if (currentScene && !SceneChanged)
    {
        currentScene->render();
    }
    SceneChanged = false;
}

SceneID SceneManager::getCurrentSceneID()
{
    return currentSceneID;
}