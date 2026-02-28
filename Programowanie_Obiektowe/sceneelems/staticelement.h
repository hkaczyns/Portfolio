/**
 * Name: staticelement.h
 * Purpose: class representing immovable elements without interactivity
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include "sceneryelement.h"

class StaticElement : public SceneryElement
{
public:
    StaticElement();
    StaticElement(const std::string &texturePath, const sf::Vector2f &position, const int width);
};