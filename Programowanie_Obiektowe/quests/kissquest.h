/**
 * Name: kissquest.h
 * Purpose: class representing the quest to kiss the princess frog and lift her curse
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "quest.h"
#include "../mechanics/playerstats.h"

class PlayerStats;

class KissQuest : public Quest
{
public:
    KissQuest();
    void updateQuest(PlayerStats &playerStats, QuestNotification &notification) override;
    void completeQuest(const PlayerStats &playerStats, QuestNotification &notification) override;
};