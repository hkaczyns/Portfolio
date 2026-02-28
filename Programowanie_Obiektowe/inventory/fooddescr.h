/**
 * Name: foofdescr.h
 * Purpose: classes representing edible objects
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once

#include "pickupobject.h"

class Carrot : public PickupObject
{
public:
    Carrot() : PickupObject(PickupCategory::CARROT, "Marchewka", L"Marchewka wybitna, że aż strach", "assets/img/objects/food/bread.png") {}
};

class Bread : public PickupObject
{
public:
    Bread() : PickupObject(PickupCategory::BREAD, "Chleb", L"Pyszny i pachnący", "assets/img/objects/food/bread.png") {}
};