/**
 * Name: towncrierquest.h
 * Purpose: class representing a quest to find the town crier
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "quest.h"
#include "../mechanics/playerstats.h"

class PlayerStats;

class TownCrierQuest : public Quest
{
public:
    TownCrierQuest();
    void updateQuest(PlayerStats &playerStats, QuestNotification &notification) override;
    void completeQuest(const PlayerStats &playerStats, QuestNotification &notification) override;
};