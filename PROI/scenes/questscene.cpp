/**
 * Name: questscene.cpp
 * Purpose: scene for displaying user's quests
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "questscene.h"
#include <iostream>

QuestScene::QuestScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats)
    : Scene(manager, stats), window(userwindow), clock(clock) {}

void QuestScene::init()
{
    staticCamera.init(window);
    background.init("assets/img/backgrounds/quests.png", sf::Vector2f(0, 0), 1920);

    if (!music.openFromFile("assets/audio/music/medieval.wav"))
    {
        std::cerr << "Error: music" << std::endl;
    }
    music.play();
    music.setVolume(10);

    if (!font.loadFromFile("assets/fonts/Cinzel-Bold.ttf"))
    {
        std::cerr << "Error: font" << std::endl;
    }
    if (!descrFont.loadFromFile("assets/fonts/CrimsonText-Regular.ttf"))
    {
        std::cerr << "Error: CrimsonText font" << std::endl;
    }

    mainText.setFont(font);
    mainText.setString(L"Misje");
    mainText.setCharacterSize(100);
    mainText.setFillColor(sf::Color::White);
    mainText.setStyle(sf::Text::Bold);
    mainText.setPosition(129, 60);

    float y = 270;

    auto activeQuests = playerStats.getActiveQuests();
    auto completedQuests = playerStats.getCompletedQuests();

    for (auto &quest : activeQuests)
    {
        sf::Text title(quest->getQuestName(), font, 24);
        title.setFillColor(sf::Color::White);
        title.setStyle(sf::Text::Regular);
        title.setPosition(180, y);
        questTitles.push_back(title);
        y += 50;
    }

    for (auto &quest : completedQuests)
    {
        sf::Text title(quest->getQuestName(), font, 24);
        title.setFillColor(sf::Color(128, 128, 128));
        title.setStyle(sf::Text::Regular);
        title.setPosition(180, y);
        questTitles.push_back(title);
        y += 50;
    }
}

void QuestScene::handleInput(sf::Event event)
{
    // Check for ESC key
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Escape))
    {
        manager.goToPrevScene(window, clock, playerStats);
        return;
    }

    // Check if any quest is selected
    for (size_t i = 0; i < questTitles.size(); ++i)
    {
        if (questTitles[i].getGlobalBounds().contains(sf::Mouse::getPosition(window).x, sf::Mouse::getPosition(window).y))
        {
            selectedQuestIndex = true;
            if (i < playerStats.getActiveQuests().size())
            {
                selectedQuestID = playerStats.getActiveQuests()[i]->getID();
            }
            else
            {
                selectedQuestID = playerStats.getCompletedQuests()[i - playerStats.getActiveQuests().size()]->getID();
            }
            break;
        }
        else
        {
            selectedQuestIndex = false;
        }
    }
}

void QuestScene::update()
{
    staticCamera.update(window);
}

void QuestScene::render()
{
    window.clear();
    window.draw(background.getSprite());
    window.draw(mainText);
    for (auto &title : questTitles)
    {
        window.draw(title);
    }

    // Display quest details
    if (selectedQuestIndex != false)
    {
        sf::Text detailsTitle;
        detailsTitle.setFont(font);
        detailsTitle.setString(playerStats.getQuest(selectedQuestID)->getQuestName());
        detailsTitle.setCharacterSize(24);
        detailsTitle.setFillColor(sf::Color::White);
        detailsTitle.setStyle(sf::Text::Regular);
        detailsTitle.setPosition(1300, 500);

        sf::Text description;
        description.setFont(descrFont);
        description.setString(playerStats.getQuest(selectedQuestID)->getDescription());
        description.setCharacterSize(18);
        description.setFillColor(sf::Color::White);
        description.setStyle(sf::Text::Regular);
        description.setPosition(1300, 530);

        sf::Text objectives;
        objectives.setFont(descrFont);
        objectives.setString(L"Wymagania:\n" + playerStats.getQuest(selectedQuestID)->getObjectives());
        objectives.setCharacterSize(18);
        objectives.setFillColor(sf::Color::White);
        objectives.setStyle(sf::Text::Regular);
        objectives.setPosition(1300, 800);

        window.draw(detailsTitle);
        window.draw(description);
        window.draw(objectives);
    }
}

void QuestScene::cleanup() {}