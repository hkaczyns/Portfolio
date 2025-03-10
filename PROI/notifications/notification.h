/**
 * Name: notification.h
 * Purpose: class representing notifications
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>

class Notification
{
protected:
    sf::Text messageHeader;
    sf::Text text;
    sf::Font font;
    sf::Clock displayClock;
    sf::Sprite backgroundSprite;
    sf::Texture backgroundTexture;
    sf::SoundBuffer showSoundBuffer;
    sf::SoundBuffer hideSoundBuffer;
    sf::Sound showSound;
    sf::Sound hideSound;

    float opacity{255.0f};
    bool fadingOut{false};
    bool visible{false};
    bool hidden{false};
    float displayTime = 3.0f;
    sf::Vector2f position;

public:
    Notification();

    virtual void setHeader(const sf::String &message);
    virtual void setMessage(const sf::String &message);
    virtual void show();
    virtual void update();
    virtual void render(sf::RenderWindow &window);
    void loadResources();
    bool isVisible();
};