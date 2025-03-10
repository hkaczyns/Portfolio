/**
 * Name: pickupdescr.h
 * Purpose: class representing the description of a pickup object in inventory
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once

#include "pickupobject.h"

class MoneyBag : public PickupObject
{
public:
    MoneyBag() : PickupObject(PickupCategory::MONEY_BAG, L"Sakwa z pieniędzmi", L"Ależ się świeci!", "assets/img/objects/forest/coin_sack.png") {}
};

class Crystal : public PickupObject
{
public:
    Crystal() : PickupObject(PickupCategory::CRYSTAL, L"Kryształ",
                             L"Lśniący się kryształ. Wygląda na bardzo cenny.",
                             "assets/img/objects/crystals/Pink_crystal1.png")
    {
    }
};