/**
 * Name: moneybagsquest.cpp
 * Purpose: class representing the quest to find money stolen by Robin Stink
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "moneybagsquest.h"
#include <iostream>

MoneyBagsQuest::MoneyBagsQuest()
    : Quest(L"Dywersyfikacja portfolio inwestycyjnego",
            L"Wygląda na to, że Robin Smród skrywa w okolicy\nskradzione worki z pieniędzmi.\nTrzeba je odzyskać!",
            L"Zbierz 5 sakiew z monetami.",
            QuestID::MONEY_BAGS){};

void MoneyBagsQuest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{
    if (playerStats.getItemQuantity(PickupCategory::MONEY_BAG) >= 5)
    {
        completeQuest(playerStats, notification);
    }
}

void MoneyBagsQuest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    Quest::completeQuest(playerStats, notification);
    notification.setHeader(L"Zadanie ukończone!");
    notification.setMessage(L"Zbierz 5 sakiew z monetami. (5/5)");
    notification.show();
}