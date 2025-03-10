/**
 * Name: princessquest.cpp
 * Purpose: class representing the quest to find the cursed princess
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "princessquest.h"
#include <iostream>

PrincessQuest::PrincessQuest()
    : Quest(L"Księżniczka i Żaba",
            L"Informacje od wieszcza sugerują, że księżniczka znajduje się w zagajniku\nw lesie na północny zachód od miasta.",
            L"Znajdź księżniczkę!",
            QuestID::PRINCESS){};

void PrincessQuest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{
}

void PrincessQuest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    Quest::completeQuest(playerStats, notification);
    notification.setHeader(L"Zadanie ukończone!");
    notification.setMessage(L"Księżniczka znaleziona!");
    notification.show();
}