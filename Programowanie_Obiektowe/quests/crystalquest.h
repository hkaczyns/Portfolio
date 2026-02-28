/**
 * Name: crystalquest.h
 * Purpose: class representing a sidequest to find 10 crystals across levels 1 and 2
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "quest.h"
#include "../mechanics/playerstats.h"

class PlayerStats;

class CrystalHuntingQuest : public Quest
{
public:
    CrystalHuntingQuest();
    void updateQuest(PlayerStats &playerStats, QuestNotification &notification) override;
    void completeQuest(const PlayerStats &playerStats, QuestNotification &notification) override;
};