/**
 * Name: robinstinkquest.h
 * Purpose: class representing a quest to kill Robin Stink
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "quest.h"
#include "../mechanics/playerstats.h"

class PlayerStats;

class RobinStinkQuest : public Quest
{
public:
    RobinStinkQuest();
    void updateQuest(PlayerStats &playerStats, QuestNotification &notification) override;
    void completeQuest(const PlayerStats &playerStats, QuestNotification &notification) override;
};