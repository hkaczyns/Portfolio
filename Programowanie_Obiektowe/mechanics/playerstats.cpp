/**
 * Name: playerstats.cpp
 * Purpose: class representing statistics and quest progress of the player. The info stays saved throughout the playthrough
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include <iostream>
#include <typeinfo>
#include <memory>
#include "playerstats.h"
#include "../quests/crystalquest.h"

PlayerStats::PlayerStats(){};

void PlayerStats::setHealth(int hp)
{
    health = hp;
}

void PlayerStats::setStrength(int s)
{
    strength = s;
}

int PlayerStats::getHealth() const
{
    return health;
}

int PlayerStats::getStrength() const
{
    return strength;
}

void PlayerStats::pickUpItem(std::shared_ptr<PickupObject> item)
{
    for (auto &invItem : inventory)
    {
        if (typeid(*invItem.item) == typeid(*item))
        {
            invItem.quantity++;
            return;
        }
    }
    inventory.push_back(InventoryItem(item, 1));
}

void PlayerStats::markItemAsPickedUp(GameObjectID itemID)
{
    pickedUpItems.insert(itemID);
}

bool PlayerStats::hasItemBeenPickedUp(GameObjectID itemID) const
{
    return pickedUpItems.find(itemID) != pickedUpItems.end();
}

void PlayerStats::defeatAdversary(GameObjectID adversaryID)
{
    defeatedAdversaries.insert(adversaryID);
}

bool PlayerStats::hasAdversaryBeenDefeated(GameObjectID adversaryID) const
{
    return defeatedAdversaries.find(adversaryID) != defeatedAdversaries.end();
}

void PlayerStats::useFood()
{
    for (auto &invItem : inventory)
    {
        if (std::dynamic_pointer_cast<Carrot>(invItem.item))
        {
            if (invItem.quantity > 0)
            {
                invItem.quantity--;
                return;
            }
        }
    }
}

const std::shared_ptr<Quest> &PlayerStats::getQuest(QuestID id)
{
    for (const auto &quest : quests)
    {
        if (quest->getID() == id)
        {
            return quest;
        }
    }
    throw std::invalid_argument("Given quest ID not found.");
}

void PlayerStats::addQuest(std::shared_ptr<Quest> quest)
{
    quests.push_back(quest);
}

const std::vector<std::shared_ptr<Quest>> &PlayerStats::getAllQuests() const
{
    return quests;
}

std::vector<std::shared_ptr<Quest>> PlayerStats::getActiveQuests() const
{
    std::vector<std::shared_ptr<Quest>> activeQuests;
    for (const auto &quest : quests)
    {
        if (!quest->isCompleted())
        {
            activeQuests.push_back(quest);
        }
    }
    return activeQuests;
}

bool PlayerStats::isQuestCompleted(QuestID id)
{
    for (const auto &quest : quests)
    {
        if (quest->getID() == id)
        {
            return quest->isCompleted();
        }
    }
    return false;
}

bool PlayerStats::isQuestInList(QuestID id)
{
    for (const auto &quest : quests)
    {
        if (quest->getID() == id)
        {
            return true;
        }
    }
    return false;
}

std::vector<std::shared_ptr<Quest>> PlayerStats::getCompletedQuests() const
{
    std::vector<std::shared_ptr<Quest>> completedQuests;
    for (const auto &quest : quests)
    {
        if (quest->isCompleted())
        {
            completedQuests.push_back(quest);
        }
    }
    return completedQuests;
}

int PlayerStats::getItemQuantity(PickupCategory category)
{
    for (const auto &invItem : inventory)
    {
        if (invItem.item->getCategory() == category)
        {
            return invItem.quantity;
        }
    }
    return 0;
}

bool PlayerStats::isDead()
{
    if (health <= 0)
        return true;
    else
        return false;
}

void PlayerStats::completeQuest(QuestID id, QuestNotification &notification)
{
    for (auto &quest : quests)
    {
        if (quest->getID() == id)
        {
            quest->completeQuest(*this, notification);
            return;
        }
    }
}

void PlayerStats::updateQuests(QuestNotification &notification)
{
    for (auto &quest : quests)
    {
        if (!quest->isCompleted())
        {
            quest->updateQuest(*this, notification);
        }
    }
}

const std::vector<InventoryItem> &PlayerStats::getInventory() const
{
    return inventory;
}

void PlayerStats::savePosition(SceneID id, const sf::Vector2f &position)
{
    levelPositions[id] = position;
}

bool PlayerStats::hasSavedPosition(SceneID id) const
{
    return levelPositions.find(id) != levelPositions.end();
}

sf::Vector2f PlayerStats::getPosition(SceneID id) const
{
    auto it = levelPositions.find(id);
    if (it != levelPositions.end())
    {
        return it->second;
    }
    return sf::Vector2f();
}

void PlayerStats::reset()
{
    health = 100;
    strength = 10;
    inventory.clear();
    quests.clear();
    pickedUpItems.clear();
    defeatedAdversaries.clear();
    levelPositions.clear();
}