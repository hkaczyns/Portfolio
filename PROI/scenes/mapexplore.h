/**
 * Name: mapexplore.h
 * Purpose: scene handling map exploration and interaction
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <memory>
#include "scene.h"
#include "../sceneelems/staticelement.h"
#include "../sceneelems/interactiveelement.h"
#include "../sceneelems/player.h"
#include "../mechanics/camera.h"
#include "../mechanics/playerstats.h"
#include "../scenes/scenemanager.h"
#include "../notifications/questnotification.h"
#include "../sceneelems/interactiveelement_pickup.h"
#include "../sceneelems/interactiveelement_adversary.h"
#include "../mechanics/mapexplore_ui.h"

class MapExplore : public Scene
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
    std::vector<std::unique_ptr<InteractiveElement>> interactiveScenery;

    // Blockades
    std::vector<Blockade> blockades;

    // View
    Camera camera;

    // Music
    sf::Music music;

    // Quest notification
    QuestNotification questNotification;

    MapExploreUI ui;

public:
    MapExplore(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats);
    void init() override;
    void handleInput(sf::Event event) override;
    void update() override;
    void render() override;
    void cleanup() override;

    void addPickUp(const std::string &texturePath, const sf::Vector2f &position, int width, std::shared_ptr<PickupObject> item, GameObjectID id);
    void addAdversaryNPC(const std::string &texturePath, const sf::Vector2f &position, int width, GameObjectID id, const std::string &inactiveTexturePath);
    void addBlockade(int width, int height, const sf::Vector2f &position);
    void showBlockades();
};