/**
 * Name: hintnotification.h
 * Purpose: class representing a hint notification
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "notification.h"

class HintNotification : public Notification
{
public:
    HintNotification()
    {
        messageHeader.setString("Wskazówka!");
        position = sf::Vector2f(30, 30);
    }
};