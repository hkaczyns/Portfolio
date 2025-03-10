/**
 * Name: kissquest.cpp
 * Purpose: class representing the quest to kiss the princess frog and lift her curse
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "kissquest.h"
#include <iostream>

KissQuest::KissQuest()
    : Quest(L"Śliska sprawa",
            L"Znaleziona w zagajniku żaba\njest ewidentnie księżniczką.\nCzas zebrać się na odwagę i pocałować płaza!",
            L"Pocałuj żabę!",
            QuestID::KISS){};

void KissQuest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{
}

void KissQuest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    Quest::completeQuest(playerStats, notification);
    notification.setHeader(L"Zadanie ukończone!");
    notification.setMessage(L"Księżniczka odczarowana!");
    notification.show();
}