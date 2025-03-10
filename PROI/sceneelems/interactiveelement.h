/**
 * Name: interactiveelement.h
 * Purpose: class representing an element which allows interaction with the player
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include "sceneryelement.h"
#include "../inventory/pickupobject.h"
#include "../mechanics/playerstats.h"

enum InteractionType
{
    ITEM,        // Item to be picked up
    SCENECHANGE, // Door to be opened
    NPC          // Non-playable character
};

class InteractiveElement : public SceneryElement
{
private:
    bool active{true};

    // "Click E" prompt
    sf::Sprite promptSprite;
    sf::Texture promptTexture;
    float promptOpacity = 0.0f;
    bool promptVisible = false;

public:
    InteractiveElement();
    InteractiveElement(const std::string &texturePath, const sf::Vector2f &position, const int width);
    bool isVisitedBy(SceneryElement &elem, float margin = 0.0f);
    bool isInteractedWith(SceneryElement &elem, float margin = 0.0f);
    void deactivate();
    void hide();
    virtual void interact(PlayerStats &playerStats);

    void updatePrompt(SceneryElement &player);
    sf::Sprite &getPromptSprite();
};