/**
 * Name: fightscene.h
 * Purpose: scene handling combat encounters
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "scene.h"
#include "../sceneelems/staticelement.h"
#include "../sceneelems/interactiveelement.h"
#include "../sceneelems/combatnpc.h"
#include "../sceneelems/player.h"
#include "../mechanics/camera.h"
#include "../mechanics/playerstats.h"
#include "../mechanics/mapexplore_ui.h"
#include "../scenes/scenemanager.h"

class FightScene : public Scene
{
protected:
    // Window
    sf::RenderWindow &window;

    // Clock
    sf::Clock &clock;

    // Background
    StaticElement background;

    // Player
    Player player;

    // Static scenery
    std::vector<StaticElement> staticScenery;

    // Interactive scenery
    std::vector<InteractiveElement> interactiveScenery;

    std::vector<CombatNPC> combatants;

    // Blockades
    std::vector<Blockade> blockades;

    // View
    Camera camera;

    // Music
    sf::Music music;

    // UI
    MapExploreUI ui;

    int combatFrameCounter{0};
    int combatNPCFrameCounter{0};
    int attackFrameCounter{0};

public:
    FightScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
    void handleInput(sf::Event event) override;
    void update() override;
    void render() override;
    void cleanup() override;
};