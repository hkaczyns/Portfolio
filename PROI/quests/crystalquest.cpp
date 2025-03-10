/**
 * Name: crystalquest.cpp
 * Purpose: class representing a sidequest to find 10 crystals across levels 1 and 2
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "crystalquest.h"
#include <iostream>

CrystalHuntingQuest::CrystalHuntingQuest()
    : Quest(L"Złap je wszystkie",
            L"W Dobrogrodzie krąży plotka, iż pewien szalony alchemik\nprzed laty ukrył w okolicach Dobrogrodu 10 pięknych\nkryształów. Trudno powiedzieć, jaką moc skrywają, ale\nlepiej, aby nie wpadły one w niepowołane ręce. Zbierz je\nwszystkie, zanim zrobi to ktoś inny.",
            L"Zbierz 10 kryształów.",
            QuestID::CRYSTAL_HUNTING){};

void CrystalHuntingQuest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{
    if (playerStats.getItemQuantity(PickupCategory::CRYSTAL) >= 10)
    {
        completeQuest(playerStats, notification);
    }
}

void CrystalHuntingQuest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    Quest::completeQuest(playerStats, notification);
    notification.setHeader(L"Zadanie ukończone!");
    notification.setMessage(L"Zbierz 10 kryształów. (10/10)");
    notification.show();
}