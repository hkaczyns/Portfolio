/**
 * Name: sceneryelement.h
 * Purpose: class representing all elements of the scenery
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include <memory>

class SceneryElement
{
protected:
    std::shared_ptr<sf::Texture> texture;
    sf::Sprite sprite;

public:
    SceneryElement();
    SceneryElement(const std::string &texturePath, const sf::Vector2f &position, const int width);
    virtual ~SceneryElement();
    virtual void init(const std::string &texturePath, const sf::Vector2f &position, const int width);

    // getters and setters
    virtual float getX() const;
    virtual float getY() const;
    virtual float getWidth() const;
    virtual float getHeight() const;
    virtual sf::Sprite &getSprite();

    virtual void setPosition(float x, float y);
    virtual void setX(float x);
    virtual void setY(float y);
    virtual void setScale(float width);
};