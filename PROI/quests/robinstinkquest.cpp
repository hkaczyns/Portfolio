/**
 * Name: robinstinkquest.cpp
 * Purpose: class representing a quest to kill Robin Stink
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "robinstinkquest.h"
#include <iostream>

RobinStinkQuest::RobinStinkQuest()
    : Quest(L"Robin Smród",
            L"W złych czasach pojawiają się źli ludzie.\nJednym z nich jest obrzydliwie podstępny ROBIN SMRÓD.\nWraz ze swoimi ziomkami skrywa się rzekomo\nna wschód od miasta.",
            L"Zgładź Robina Smróda i jego ziomków!",
            QuestID::ROBIN_STINK){};

void RobinStinkQuest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{}

void RobinStinkQuest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    Quest::completeQuest(playerStats, notification);
    notification.setHeader(L"Zadanie ukończone!");
    notification.setMessage(L"Robin Smród poskromiony!");
    notification.show();
}