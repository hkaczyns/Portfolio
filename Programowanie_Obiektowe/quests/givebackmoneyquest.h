/**
 * Name: givebackmoneyquest.h
 * Purpose: class representing the quest to return the found stolen money to the town crier
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "quest.h"
#include "../mechanics/playerstats.h"

class PlayerStats;

class GiveBackMoneyQuest : public Quest
{
public:
    GiveBackMoneyQuest();
    void updateQuest(PlayerStats &playerStats, QuestNotification &notification) override;
    void completeQuest(const PlayerStats &playerStats, QuestNotification &notification) override;
};