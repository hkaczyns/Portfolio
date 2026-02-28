/**
 * Name: towncrierquest.cpp
 * Purpose: class representing a quest to find the town crier
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "towncrierquest.h"
#include <iostream>

TownCrierQuest::TownCrierQuest()
    : Quest(L"Wieść niesie",
            L"Dziś na rynku ma wystąpić miastowy wieszcz.\nKieruj się do centralnej części miasta,\ngdzie na wschód od straganów\nznajdziesz wieszcza na mównicy.",
            L"Znajdź wieszcza",
            QuestID::TOWN_CRIER){};

void TownCrierQuest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{}

void TownCrierQuest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    Quest::completeQuest(playerStats, notification);
    notification.setHeader(L"Zadanie ukończone!");
    notification.setMessage(L"Wieszcz znaleziony!");
    notification.show();
}