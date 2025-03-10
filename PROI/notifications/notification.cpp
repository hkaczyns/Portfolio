/**
 * Name: notification.cpp
 * Purpose: class representing notifications
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "notification.h"
#include <iostream>

Notification::Notification()
{
    loadResources();
    messageHeader.setFont(font);
    messageHeader.setCharacterSize(28);
    messageHeader.setFillColor(sf::Color(255, 255, 255, opacity));
    text.setFont(font);
    text.setCharacterSize(24);
    text.setFillColor(sf::Color(255, 255, 255, opacity));
}

void Notification::loadResources()
{
    if (!font.loadFromFile("assets/fonts/Cinzel-Bold.ttf"))
    {
        std::cerr << "Failed to load font for notification!" << std::endl;
    }
    if (!backgroundTexture.loadFromFile("assets/img/ui/hint_notification.png"))
    {
        std::cerr << "Failed to load notification background!" << std::endl;
    }
    backgroundSprite.setTexture(backgroundTexture);

    if (!showSoundBuffer.loadFromFile("assets/audio/music/notification.wav"))
    {
        std::cerr << "Failed to load show sound!" << std::endl;
    }
    if (!hideSoundBuffer.loadFromFile("assets/audio/music/notification_exit.wav"))
    {
        std::cerr << "Failed to load hide sound!" << std::endl;
    }
    backgroundSprite.setScale(0.3f, 0.3f);
    showSound.setBuffer(showSoundBuffer);
    showSound.setVolume(25);
    hideSound.setBuffer(hideSoundBuffer);
}

void Notification::setHeader(const sf::String &message)
{
    messageHeader.setString(message);
}

void Notification::setMessage(const sf::String &message)
{
    text.setString(message);
}

void Notification::show()
{
    visible = true;
    fadingOut = false;
    opacity = 0.0f;
    displayClock.restart();
    showSound.play();
}

void Notification::update()
{
    float time = displayClock.getElapsedTime().asSeconds();
    // Notification fade-in
    if (visible && !fadingOut && time < displayTime)
    {
        opacity = std::min(200.0f, opacity + 500.0f * time / displayTime);
    }
    else if (visible && !fadingOut && time >= displayTime)
    {
        fadingOut = true;
        displayClock.restart();
    }
    else if (fadingOut)
    {
        opacity = 200.0f - std::min(200.0f, 2000.0f * displayClock.getElapsedTime().asSeconds() / displayTime);
        if (opacity <= 250.0f && !hidden)
        {
            hidden = true;
            hideSound.play();
        }
        if (opacity <= 0.0f)
        {
            visible = false;
        }
    }
    messageHeader.setFillColor(sf::Color(255, 255, 255, opacity));
    text.setFillColor(sf::Color(255, 255, 255, opacity));
    backgroundSprite.setColor(sf::Color(255, 255, 255, opacity));
}

void Notification::render(sf::RenderWindow &window)
{
    messageHeader.setPosition(window.getView().getCenter().x - window.getView().getSize().x / 2.0f + position.x + 50,
                              window.getView().getCenter().y - window.getView().getSize().y / 2.0f + position.y + 10);
    text.setPosition(window.getView().getCenter().x - window.getView().getSize().x / 2.0f + position.x + 50,
                     window.getView().getCenter().y - window.getView().getSize().y / 2.0f + position.y + 40);
    backgroundSprite.setPosition(window.getView().getCenter().x - window.getView().getSize().x / 2.0f + position.x,
                                 window.getView().getCenter().y - window.getView().getSize().y / 2.0f + position.y);

    if (visible)
    {
        window.draw(backgroundSprite);
        window.draw(messageHeader);
        window.draw(text);
    }
}

bool Notification::isVisible()
{
    return visible;
}