/**
 * Name: fightscene.cpp
 * Purpose: scene handling combat encounters
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "fightscene.h"
#include <iostream>

FightScene::FightScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats) : Scene(manager, stats), window(userwindow), clock(clock) {}

void FightScene::init()
{
    // Load a player
    sf::Vector2f playerPosition = sf::Vector2f(window.getSize().x / 2.0f, window.getSize().y / 2.0f);
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

    ui.init("assets/img/backgrounds/combat_shortcuts.png");
}

void FightScene::handleInput(sf::Event event)
{
    // Calculate time elapsed and restart the clock
    float deltaTime = clock.restart().asSeconds();
    player.handleInput(deltaTime);
}

void FightScene::update()
{
    player.update(background, blockades);
    camera.update(window, player, background);
    ui.update(playerStats);

    attackFrameCounter++;
    if (attackFrameCounter >= 40 && sf::Keyboard::isKeyPressed(sf::Keyboard::C))
    {
        player.attack();
    }
    if (attackFrameCounter >= 120)
    {
        attackFrameCounter = 0;
    }

    // for each combatant
    for (CombatNPC &combatant : combatants)
    {
        combatFrameCounter++;
        combatNPCFrameCounter++;
        if (combatFrameCounter >= 20)
        {
            combatFrameCounter = 0;

            if (combatant.isAttacked(player))
            {
                combatant.receiveDamage(playerStats);
            }

            if (combatant.isDefeated())
            {
                playerStats.defeatAdversary(combatant.getId());
                manager.goToPrevScene(window, clock, playerStats);
                return;
            }

            combatant.walk();
        }
        if (combatNPCFrameCounter >= 40)
        {
            combatNPCFrameCounter = 0;
            if (combatant.isVisitedBy(player))
            {
                combatant.attack(playerStats);
            }

            if (playerStats.isDead())
            {
                manager.changeScene(SceneID::Cutscene_Death, window, clock, playerStats);
                return;
            }
        }

        if (!combatant.isVisitedBy(player))
            combatant.approach(player);
    }
}

void FightScene::render()
{

    // Render
    window.clear(); // Clear old frame

    window.draw(background.getSprite()); // Draw the background first

    for (StaticElement &v : staticScenery)
    {
        window.draw(v.getSprite());
    }

    for (InteractiveElement &v : interactiveScenery)
    {
        window.draw(v.getSprite());
    }

    for (CombatNPC &v : combatants)
    {
        window.draw(v.getSprite());
    }

    for (Blockade &v : blockades)
    {
        window.draw(v.rectangle);
    }

    window.draw(player.getSprite()); // Draw the sprite on top

    ui.draw(window);
}

void FightScene::cleanup()
{
}
