/**
 * Name: mapexplore.cpp
 * Purpose: scene handling map exploration and interaction
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "mapexplore.h"
#include <iostream>

MapExplore::MapExplore(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats) : Scene(manager, stats), window(userwindow), clock(clock) {}

void MapExplore::init()
{
    // Load a player
    sf::Vector2f playerPosition = sf::Vector2f(window.getSize().x / 2.0f, window.getSize().y / 2.0f);
    playerPosition = playerStats.hasSavedPosition(manager.getCurrentSceneID()) ? playerStats.getPosition(manager.getCurrentSceneID()) : playerPosition;
    player.init("assets/img/sprites/stand1.png", playerPosition, 70);

    // Create a view centered on the player
    camera.init(window, player);

    // Add music
    if (!music.openFromFile("assets/audio/music/medieval.wav"))
    {
        std::cerr << "Error: music" << std::endl;
    }
    music.play();
    music.setVolume(10);

    ui.init();
}

void MapExplore::handleInput(sf::Event event)
{
    // Calculate time elapsed and restart the clock
    float deltaTime = clock.restart().asSeconds();
    player.handleInput(deltaTime);

    // If I clicked, go to inventory
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::I))
    {
        manager.changeScene(SceneID::Inventory, window, clock, playerStats);
        return;
    }

    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Q))
    {
        manager.changeScene(SceneID::Quests, window, clock, playerStats);
        return;
    }
}

void MapExplore::update()
{
    player.update(background, blockades);
    playerStats.savePosition(manager.getCurrentSceneID(), player.getPosition());
    playerStats.updateQuests(questNotification);
    ui.update(playerStats);
    camera.update(window, player, background);
    questNotification.update();
}

void MapExplore::render()
{

    // Render
    window.clear(); // Clear old frame

    window.draw(background.getSprite()); // Draw the background first

    for (StaticElement &v : staticScenery)
    {
        window.draw(v.getSprite());
    }

    for (auto &v : interactiveScenery)
    {
        window.draw(v->getSprite());
        v->updatePrompt(player);
        window.draw(v->getPromptSprite());
    }

    for (Blockade &v : blockades)
    {
        window.draw(v.rectangle);
    }

    window.draw(player.getSprite()); // Draw the sprite on top

    questNotification.render(window);

    ui.draw(window);
}

void MapExplore::cleanup()
{
}

void MapExplore::addPickUp(const std::string &texturePath, const sf::Vector2f &position, int width, std::shared_ptr<PickupObject> item, GameObjectID id)
{
    if (!playerStats.hasItemBeenPickedUp(id))
    {
        interactiveScenery.push_back(std::make_unique<PickupElement>(texturePath, position, width, item, id));
    }
}

void MapExplore::addAdversaryNPC(const std::string &texturePath, const sf::Vector2f &position, int width, GameObjectID id, const std::string &inactiveTexturePath)
{
    if (!playerStats.hasAdversaryBeenDefeated(id))
    {
        interactiveScenery.push_back(std::make_unique<AdversaryNPCElement>(texturePath, position, width, id));
    }
    else
    {
        interactiveScenery.push_back(std::make_unique<AdversaryNPCElement>(inactiveTexturePath, position, width, id));
        interactiveScenery.back()->deactivate();
    }
}

void MapExplore::addBlockade(int width, int height, const sf::Vector2f &position)
{
    blockades.push_back(Blockade(width, height, position.x, position.y, sf::Color(255, 0, 0, 0)));
}

void MapExplore::showBlockades()
{
    for (Blockade &blockade : blockades)
    {
        blockade.show();
    }
}