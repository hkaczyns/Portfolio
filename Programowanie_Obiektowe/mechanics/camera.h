/**
 * Name: camera.h
 * Purpose: class representing a movable camera
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include "../sceneelems/player.h"

class Camera
{
private:
    sf::View view;

public:
    Camera();
    void init(sf::RenderWindow &window, Player &player);

    void setCenter(const sf::Vector2f &center);
    void move(const sf::Vector2f &vec);
    void zoom(float scale);
    void rotate(float angle);

    void update(sf::RenderWindow &window, Player &player, SceneryElement &background);

    sf::View &getView();
};