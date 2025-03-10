/**
 * Name: endmenu.cpp
 * Purpose: scene handling menu scene after game completion
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "endmenu.h"

EndMenuScene::EndMenuScene(sf::RenderWindow &window, sf::Clock &clock, SceneManager &manager, PlayerStats &stats)
    : Scene(manager, stats), window(window), clock(clock)
{
    // Create a view centered on the player
    staticCamera.init(window);

    // Load background texture
    background.init("assets/img/backgrounds/end_menu.png", sf::Vector2f(0, 0), 1920);

    if (!font.loadFromFile("assets/fonts/Cinzel-Bold.ttf"))
    {
        std::cerr << "Error loading font" << std::endl;
    }

    mainText.setFont(font);
    mainText.setString(L"MACIEJ BOGUSŁAWSKI · HUBERT KACZYŃSKI");
    mainText.setCharacterSize(15);
    mainText.setFillColor(sf::Color(200, 200, 200, 255));
    mainText.setPosition(
        window.getSize().x / 2.f - mainText.getGlobalBounds().width / 2.f,
        1050);

    smallerText.setFont(font);
    smallerText.setString(L"DZIĘKUJEMY ZA GRĘ");
    smallerText.setCharacterSize(24);
    smallerText.setFillColor(sf::Color::White);
    smallerText.setPosition(
        window.getSize().x / 2.f - smallerText.getGlobalBounds().width / 2.f,
        470);

    newGameButton.setSize(sf::Vector2f(300.f, 50.f));
    newGameButton.setFillColor(sf::Color(0, 0, 0, 150));
    newGameButton.setPosition(
        window.getSize().x / 2.f - newGameButton.getSize().x / 2.f,
        530);

    newGameButtonText.setFont(font);
    newGameButtonText.setString(L"WRÓĆ DO MENU");
    newGameButtonText.setCharacterSize(24);
    newGameButtonText.setFillColor(sf::Color::White);
    newGameButtonText.setPosition(
        newGameButton.getPosition().x + newGameButton.getSize().x / 2.f - newGameButtonText.getGlobalBounds().width / 2.f,
        540);
}

void EndMenuScene::init()
{
}

void EndMenuScene::handleInput(sf::Event event)
{
    clock.restart();
    if (event.type == sf::Event::MouseButtonPressed)
    {
        if (event.mouseButton.button == sf::Mouse::Left)
        {
            sf::Vector2i mousePos = sf::Mouse::getPosition(window);
            if (newGameButton.getGlobalBounds().contains(static_cast<sf::Vector2f>(mousePos)))
            {
                playerStats.reset();
                manager.changeScene(SceneID::MainMenu, window, clock, playerStats);
                return;
            }
        }
    }
}

void EndMenuScene::update()
{
    staticCamera.update(window);
}

void EndMenuScene::render()
{
    window.clear();
    window.draw(background.getSprite());
    window.draw(mainText);
    window.draw(smallerText);
    window.draw(newGameButton);
    window.draw(newGameButtonText);
    window.display();
}