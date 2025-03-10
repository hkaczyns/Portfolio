/**
 * Name: questnotification.h
 * Purpose: class representing a quest notification informing of recieving a new quest or completion
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "notification.h"

class QuestNotification : public Notification
{
public:
    QuestNotification()
    {
        messageHeader.setString("Nowe zadanie!");
        position = sf::Vector2f(10, 10);
        text.setCharacterSize(18);
    }
};