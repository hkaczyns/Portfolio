/**
 * Name: playerstats.h
 * Purpose: class representing statistics and quest progress of the player. The info stays saved throughout the playthrough
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <iostream>
#include <vector>
#include <memory>
#include <map>
#include "../inventory/inventoryitem.h"
#include "../inventory/pickupobject.h"
#include "../inventory/fooddescr.h"
#include "../inventory/pickupdescr.h"
#include "../notifications/questnotification.h"
#include "../sceneelems/objectids.h"

class Quest;
enum class QuestID;
enum class SceneID;

class PlayerStats
{
private:
    int health{100};
    int strength{10};
    std::vector<InventoryItem> inventory;
    std::vector<std::shared_ptr<Quest>> quests;

    std::set<GameObjectID> pickedUpItems;
    std::set<GameObjectID> defeatedAdversaries;
    std::map<SceneID, sf::Vector2f> levelPositions;

public:
    PlayerStats();
    void setHealth(int health);
    void setStrength(int strength);
    int getHealth() const;
    int getStrength() const;

    void pickUpItem(std::shared_ptr<PickupObject> item);
    void markItemAsPickedUp(GameObjectID itemID);
    bool hasItemBeenPickedUp(GameObjectID itemID) const;

    void defeatAdversary(GameObjectID adversaryID);
    bool hasAdversaryBeenDefeated(GameObjectID adversaryID) const;

    int getItemQuantity(PickupCategory category);
    void useFood();
    bool isDead();

    const std::shared_ptr<Quest> &getQuest(QuestID id);
    bool isQuestCompleted(QuestID id);
    bool isQuestInList(QuestID id);
    void addQuest(std::shared_ptr<Quest> quest);
    void completeQuest(QuestID id, QuestNotification &notification);
    void updateQuests(QuestNotification &notification);
    const std::vector<InventoryItem> &getInventory() const;

    const std::vector<std::shared_ptr<Quest>> &getAllQuests() const;
    std::vector<std::shared_ptr<Quest>> getActiveQuests() const;
    std::vector<std::shared_ptr<Quest>> getCompletedQuests() const;

    void savePosition(SceneID id, const sf::Vector2f &position);
    bool hasSavedPosition(SceneID id) const;
    sf::Vector2f getPosition(SceneID id) const;

    void reset();
};