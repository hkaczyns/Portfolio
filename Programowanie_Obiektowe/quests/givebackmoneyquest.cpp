/**
 * Name: givebackmoneyquest.cpp
 * Purpose: class representing the quest to return the found stolen money to the town crier
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "givebackmoneyquest.h"
#include <iostream>

GiveBackMoneyQuest::GiveBackMoneyQuest()
    : Quest(L"Redystrybucja mienia",
            L"Skradzione przez Robina Smróda pieniądze\npowinny wrócić do mieszkańców.",
            L"Zwróć skradzione pieniądze wieszczowi.",
            QuestID::GIVE_BACK_MONEY){};

void GiveBackMoneyQuest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{
}

void GiveBackMoneyQuest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    Quest::completeQuest(playerStats, notification);
    notification.setHeader(L"Zadanie ukończone!");
    notification.setMessage(L"Pieniądze są w bezpiecznych rękach!");
    notification.show();
}