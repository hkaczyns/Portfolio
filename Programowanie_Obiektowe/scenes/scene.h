/**
 * Name: scene.h
 * Purpose: abstract class for scenes
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include "../mechanics/playerstats.h"

class SceneManager;

class Scene
{
public:
    SceneManager &manager;
    PlayerStats &playerStats;
    Scene(SceneManager &manager, PlayerStats &stats) : manager(manager), playerStats(stats) {}
    virtual ~Scene() = default;
    virtual void init() = 0;
    virtual void loadScenery() = 0;
    virtual void handleInput(sf::Event event) = 0;
    virtual void update() = 0;
    virtual void customUpdate() = 0;
    virtual void render() = 0;
    virtual void cleanup() = 0;
};