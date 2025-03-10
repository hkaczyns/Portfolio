/**
 * Name: menuscene.cpp
 * Purpose: main menu scene
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "menuscene.h"

MenuScene::MenuScene(sf::RenderWindow &window, sf::Clock &clock, SceneManager &manager, PlayerStats &stats)
    : Scene(manager, stats), window(window), clock(clock)
{
    // Create a view centered on the player
    staticCamera.init(window);

    // Load background texture
    background.init("assets/img/backgrounds/main_menu.png", sf::Vector2f(0, 0), 1920);

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
    smallerText.setString(L"Czy jesteś gotowy?");
    smallerText.setCharacterSize(24);
    smallerText.setFillColor(sf::Color::White);
    smallerText.setPosition(
        window.getSize().x / 2.f - smallerText.getGlobalBounds().width / 2.f,
        400);

    newGameButton.setSize(sf::Vector2f(200.f, 50.f));
    newGameButton.setFillColor(sf::Color(0, 0, 0, 100));
    newGameButton.setPosition(
        window.getSize().x / 2.f - newGameButton.getSize().x / 2.f,
        300);

    newGameButtonText.setFont(font);
    newGameButtonText.setString("Nowa Gra");
    newGameButtonText.setCharacterSize(24);
    newGameButtonText.setFillColor(sf::Color::White);
    newGameButtonText.setPosition(
        newGameButton.getPosition().x + newGameButton.getSize().x / 2.f - newGameButtonText.getGlobalBounds().width / 2.f,
        310);
}

void MenuScene::init()
{
}

void MenuScene::handleInput(sf::Event event)
{
    clock.restart();
    if (event.type == sf::Event::MouseButtonPressed)
    {
        if (event.mouseButton.button == sf::Mouse::Left)
        {
            sf::Vector2i mousePos = sf::Mouse::getPosition(window);
            if (newGameButton.getGlobalBounds().contains(static_cast<sf::Vector2f>(mousePos)))
            {
                manager.changeScene(SceneID::Level1, window, clock, playerStats);
                return;
            }
        }
    }
}

void MenuScene::update()
{
    staticCamera.update(window);
}

void MenuScene::render()
{
    window.clear();
    window.draw(background.getSprite());
    window.draw(mainText);
    // window.draw(smallerText);
    window.draw(newGameButton);
    window.draw(newGameButtonText);
    window.display();
}