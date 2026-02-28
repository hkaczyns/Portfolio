/**
 * Name: staticelement.cpp
 * Purpose: class representing immovable elements without interactivity
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "staticelement.h"
#include <iostream>

StaticElement::StaticElement() : SceneryElement() {}
StaticElement::StaticElement(const std::string &texturePath, const sf::Vector2f &position, const int width) { init(texturePath, position, width); }