/**
 * Name: scenemanager.h
 * Purpose: manages scene changes
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <memory>
#include "scene.h"
#include <SFML/Graphics.hpp>
#include "../mechanics/playerstats.h"

enum class SceneID
{
    Start,
    MainMenu,
    Inventory,
    Quests,
    Level1,
    Cutscene1,
    Level2,
    combat1,
    Cutscene_Death,
    Cutscene2,
    Level3,
    Cutscene3_1,
    EndMenu
};

class SceneManager
{
private:
    SceneID prevSceneID{SceneID::Start};
    SceneID currentSceneID{SceneID::Start};
    std::unique_ptr<Scene> currentScene;
    bool SceneChanged = false;

public:
    void changeScene(SceneID ID, sf::RenderWindow &window, sf::Clock &clock, PlayerStats &stats);
    void goToPrevScene(sf::RenderWindow &window, sf::Clock &clock, PlayerStats &stats);
    void handleInput(sf::Event event);
    void update();
    void render();

    SceneID getCurrentSceneID();
};