/**
 * Name: quest.cpp
 * Purpose: class representing quests
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "quest.h"
#include "../mechanics/playerstats.h"

Quest::Quest(sf::String questname, sf::String description, sf::String objectives, QuestID id)
    : questname(questname), description(description), objectives(objectives), id(id) {}

QuestID Quest::getID() const
{
    return id;
}

void Quest::completeQuest(const PlayerStats &playerStats, QuestNotification &notification)
{
    completed = true;
}

void Quest::updateQuest(PlayerStats &playerStats, QuestNotification &notification)
{
}

sf::String Quest::getQuestName() const
{
    return questname;
}

sf::String Quest::getDescription() const
{
    return description;
}

sf::String Quest::getObjectives() const
{
    return objectives;
}

bool Quest::isCompleted() const
{
    return completed;
}

bool Quest::getWasSeen()
{
    return wasSeen;
}

void Quest::setWasSeen(bool flag)
{
    wasSeen = flag;
}
