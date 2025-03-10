/**
 * Name: questscene.h
 * Purpose: scene for displaying user's quests
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "scene.h"
#include "../sceneelems/staticelement.h"
#include "../mechanics/staticcamera.h"
#include "../mechanics/playerstats.h"
#include "../scenes/scenemanager.h"
#include "../notifications/questnotification.h"
#include "../quests/quest.h"

class QuestScene : public Scene
{
protected:
    sf::RenderWindow &window;
    sf::Clock &clock;
    StaticElement background;
    StaticCamera staticCamera;
    sf::Music music;
    sf::Font font;
    sf::Font descrFont;

    // List of quests
    std::vector<sf::Text> questTitles;
    std::vector<sf::Text> questDetailsTitles;

    sf::Text mainText;

    // Selected quest
    bool selectedQuestIndex = false;
    QuestID selectedQuestID{};

public:
    QuestScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
    void loadScenery() override {};
    void handleInput(sf::Event event) override;
    void update() override;
    void customUpdate() override {};
    void render() override;
    void cleanup() override;
};