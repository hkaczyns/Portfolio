/**
 * Name: camera.cpp
 * Purpose: class representing a movable camera
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "camera.h"

Camera::Camera() {}

void Camera::init(sf::RenderWindow &window, Player &player)
{
    view = sf::View(sf::FloatRect(0, 0, window.getSize().x, window.getSize().y));
    view.setCenter(player.getX(), player.getY());
    window.setView(view);
}

void Camera::setCenter(const sf::Vector2f &center)
{
    view.setCenter(center);
}

void Camera::move(const sf::Vector2f &vec)
{
    view.move(vec);
}

void Camera::zoom(float scale)
{
    view.zoom(scale);
}

void Camera::rotate(float angle)
{
    view.rotate(angle);
}

void Camera::update(sf::RenderWindow &window, Player &player, SceneryElement &background)
{
    float aspectRatio = float(window.getSize().x) / float(window.getSize().y);
    sf::View adjustedView = view;

    if (aspectRatio > 16.f / 9.f)
    { // wider
        adjustedView.setSize(1920, 1920 / aspectRatio);
    }
    else if (aspectRatio < 16.f / 9.f)
    { // taller
        adjustedView.setSize(1080 * aspectRatio, 1080);
    }

    view = adjustedView;

    // Apply the updated view to the window
    window.setView(view);

    // Dimensions of the view
    int viewWidth = view.getSize().x;
    int viewHeight = view.getSize().y;

    // Dimensions of the background
    float bgWidth = background.getWidth();
    float bgHeight = background.getHeight();

    float newX = std::max(viewWidth / 2.0f, std::min(player.getX() * 1.0f, bgWidth - viewWidth / 2.0f));
    float newY = std::max(viewHeight / 2.0f, std::min(player.getY() * 1.0f, bgHeight - viewHeight / 2.0f));

    view.setCenter(newX, newY);
}

sf::View &Camera::getView()
{
    return view;
}