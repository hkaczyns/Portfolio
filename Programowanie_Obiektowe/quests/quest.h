/**
 * Name: quest.h
 * Purpose: class representing quests
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <string>
#include "../mechanics/playerstats.h"
#include "../notifications/questnotification.h"

class PlayerStats;

// enum of possible tasks
enum class QuestID
{
    CRYSTAL_HUNTING,
    TOWN_CRIER,
    ROBIN_STINK,
    MONEY_BAGS,
    GIVE_BACK_MONEY,
    PRINCESS,
    KISS
};

class Quest
{
protected:
    sf::String questname{"Default name"};
    sf::String description{"Default description"};
    sf::String objectives{"Default objectives"};
    QuestID id;
    bool completed{false};
    bool wasSeen = false;

public:
    Quest(sf::String questname, sf::String description, sf::String objectives, QuestID id);
    virtual ~Quest() {}
    QuestID getID() const;
    virtual void updateQuest(PlayerStats &playerStats, QuestNotification &notification);
    virtual void completeQuest(const PlayerStats &playerStats, QuestNotification &notification);
    bool isCompleted() const;
    sf::String getQuestName() const;
    sf::String getDescription() const;
    sf::String getObjectives() const;
    bool getWasSeen();
    void setWasSeen(bool flag);
};