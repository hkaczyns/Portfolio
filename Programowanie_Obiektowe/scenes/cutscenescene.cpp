/**
 * Name: cutscenescene.cpp
 * Purpose: scene handling cutscenes
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "cutscenescene.h"

CutsceneScene::CutsceneScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats, const std::string &musicPath, const std::string &dubbingPath, SceneID nextSceneID)
    : Scene(manager, stats), window(userwindow), clock(clock), nextSceneID(nextSceneID)
{
    staticCamera.init(window);
    if (!backgroundMusic.openFromFile(musicPath))
    {
        std::cerr << "Error loading music" << std::endl;
    }
    if (!dubbingBuffer.loadFromFile(dubbingPath))
    {
        std::cerr << "Error loading dubbing" << std::endl;
    }
    dubbing.setBuffer(dubbingBuffer);

    if (!textFont.loadFromFile("assets/fonts/Cinzel-Bold.ttf"))
    {
        std::cerr << "Error loading font" << std::endl;
    }

    displayText.setFont(textFont);
    displayText.setCharacterSize(24);
    displayText.setFillColor(sf::Color::White);
    displayText.setPosition(50, 1000);
}

void CutsceneScene::init()
{
    backgroundMusic.setVolume(10);
    backgroundMusic.play();
    backgroundMusic.setLoop(true);
    dubbing.play();
    currentFrameIndex = 0;
    currentFrameTime = 0;
    currentTextIndex = 0;
    currentTextTime = 0;
}

void CutsceneScene::loadScenery()
{
    currentFrameSprite.setPosition(0.f, 0.f);
    setFrame(0);
    setText(0);
}

void CutsceneScene::handleInput(sf::Event event)
{
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Escape) || sf::Keyboard::isKeyPressed(sf::Keyboard::Space) || sf::Keyboard::isKeyPressed(sf::Keyboard::Enter))
    {
        manager.changeScene(nextSceneID, window, clock, playerStats);
        return;
    }
}

void CutsceneScene::update()
{
    staticCamera.update(window);
    float deltaTime = clock.restart().asSeconds();
    currentFrameTime += deltaTime;
    currentTextTime += deltaTime;

    if (currentFrameIndex < frames.size() && currentFrameTime >= frames[currentFrameIndex - 1].getDuration())
    {
        setFrame(currentFrameIndex);
    }

    if (currentTextIndex < timedText.size() && currentTextTime >= timedText[currentTextIndex - 1].second)
    {
        setText(currentTextIndex);
    }

    if (currentFrameIndex >= frames.size() && currentFrameTime >= frames[currentFrameIndex - 1].getDuration())
    {
        manager.changeScene(nextSceneID, window, clock, playerStats);
    }
}

void CutsceneScene::setFrame(int index)
{
    currentFrameTime = 0;
    if (currentFrameIndex < frames.size())
    {
        if (!currentFrameTexture.loadFromFile(frames[currentFrameIndex].getPath()))
        {
            std::cerr << "Error loading frame" << std::endl;
        };
        currentFrameSprite.setTexture(currentFrameTexture);
        currentFrameSprite.setScale(1920.f / currentFrameSprite.getGlobalBounds().width, 1920.f / currentFrameSprite.getGlobalBounds().width);
    }
    currentFrameIndex++;
}

void CutsceneScene::setText(int index)
{
    currentTextTime = 0;
    if (currentTextIndex < timedText.size())
    {
        displayText.setString(timedText[currentTextIndex].first);
    }
    currentTextIndex++;
}

void CutsceneScene::render()
{
    window.clear();
    window.draw(currentFrameSprite);
    window.draw(displayText);
}

void CutsceneScene::cleanup()
{
    backgroundMusic.stop();
    dubbing.stop();
}