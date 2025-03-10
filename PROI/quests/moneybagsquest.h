/**
 * Name: moneybagsquest.h
 * Purpose: class representing the quest to find money stolen by Robin Stink
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "quest.h"
#include "givebackmoneyquest.h"
#include "../mechanics/playerstats.h"

class PlayerStats;

class MoneyBagsQuest : public Quest
{
public:
    MoneyBagsQuest();
    void updateQuest(PlayerStats &playerStats, QuestNotification &notification) override;
    void completeQuest(const PlayerStats &playerStats, QuestNotification &notification) override;
};