/**
 * Name: princessquest.h
 * Purpose: class representing the quest to find the cursed princess
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "quest.h"
#include "../mechanics/playerstats.h"

class PlayerStats;

class PrincessQuest : public Quest
{
public:
    PrincessQuest();
    void updateQuest(PlayerStats &playerStats, QuestNotification &notification) override;
    void completeQuest(const PlayerStats &playerStats, QuestNotification &notification) override;
};