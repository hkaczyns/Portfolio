/**
 * Name: staticcamera.h
 * Purpose: class representing an immovable camera, used for example in inventory view
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>

class StaticCamera
{
private:
    sf::View view;

public:
    StaticCamera();
    void init(sf::RenderWindow &window);
    void update(sf::RenderWindow &window);

    sf::View &getView();
};