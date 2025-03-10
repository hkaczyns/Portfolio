/**
 * Name: staticcamera.cpp
 * Purpose: class representing an immovable camera, used for example in inventory view
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "staticcamera.h"

StaticCamera::StaticCamera() {}

void StaticCamera::init(sf::RenderWindow &window)
{
    view = sf::View(sf::FloatRect(0, 0, window.getSize().x, window.getSize().y));
    window.setView(view);
}

void StaticCamera::update(sf::RenderWindow &window)
{
    float aspectRatio = float(window.getSize().x) / float(window.getSize().y);
    sf::View adjustedView = view;

    if (aspectRatio > 16.f / 9.f)
    {
        adjustedView.setSize(1920, 1920 / aspectRatio);
    }
    else if (aspectRatio < 16.f / 9.f)
    {
        adjustedView.setSize(1080 * aspectRatio, 1080);
    }
    window.setView(adjustedView);
}