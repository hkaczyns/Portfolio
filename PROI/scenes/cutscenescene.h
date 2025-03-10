/**
 * Name: cutscenescene.h
 * Purpose: scene handling cutscenes
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#pragma once
#include "scene.h"
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <vector>
#include "scenemanager.h"
#include "../cutscenes/cutsceneframe.h"
#include "../mechanics/staticcamera.h"

class CutsceneScene : public Scene
{
protected:
    sf::RenderWindow &window;
    sf::Clock &clock;
    StaticCamera staticCamera;
    SceneID nextSceneID;

    std::vector<CutsceneFrame> frames;
    std::vector<std::pair<sf::String, int>> timedText;
    sf::Music backgroundMusic;
    sf::Sound dubbing;
    sf::SoundBuffer dubbingBuffer;
    sf::Text displayText;
    sf::Font textFont;

    sf::Texture currentFrameTexture;
    sf::Sprite currentFrameSprite;

    unsigned int currentFrameIndex;
    unsigned int currentTextIndex;
    float currentFrameTime;
    float currentTextTime;

public:
    CutsceneScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats, const std::string &musicPath, const std::string &dubbingPath, SceneID nextSceneID);
    virtual ~CutsceneScene() {}
    void init() override;
    void loadScenery() override;
    void handleInput(sf::Event event) override;
    void update() override;
    void customUpdate() override {};
    void render() override;
    void cleanup() override;

    void setFrame(int index);
    void setText(int index);
};