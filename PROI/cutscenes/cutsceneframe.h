/**
 * Name: cutsceneframe.h
 * Purpose: class representing a frame in a cutscene
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include <string>

class CutsceneFrame
{
private:
    std::string assetPath;
    int displaySeconds;

public:
    CutsceneFrame(const std::string &path, int seconds) : assetPath(path), displaySeconds(seconds) {}
    const std::string &getPath() const { return assetPath; }
    int getDuration() const { return displaySeconds; }
};