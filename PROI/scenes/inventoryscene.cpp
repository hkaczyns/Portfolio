/**
 * Name: inventoryscene.cpp
 * Purpose: scene handling viewing of the player's inventory
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include "inventoryscene.h"
#include <iostream>

InventoryScene::InventoryScene(sf::RenderWindow &userwindow, sf::Clock &clock, SceneManager &manager, PlayerStats &stats) : Scene(manager, stats), window(userwindow), clock(clock) {}

void InventoryScene::init()
{
    // Create a view centered on the player
    staticCamera.init(window);

    // Load background texture
    background.init("assets/img/backgrounds/inventory.png", sf::Vector2f(0, 0), 1920);

    // Add music
    if (!music.openFromFile("assets/audio/music/medieval.wav"))
    {
        std::cerr << "Error: music" << std::endl;
    }
    music.play();
    music.setVolume(10);

    // Load font
    if (!font.loadFromFile("assets/fonts/Cinzel-Bold.ttf"))
    {
        std::cerr << "Error: font" << std::endl;
    }

    // Load description font
    if (!descrFont.loadFromFile("assets/fonts/CrimsonText-Regular.ttf"))
    {
        std::cerr << "Error: CrimsonText font" << std::endl;
    }

    mainText.setFont(font);
    mainText.setString(L"Inwentarz");
    mainText.setCharacterSize(100);
    mainText.setFillColor(sf::Color::White);
    mainText.setStyle(sf::Text::Bold);
    mainText.setPosition(129, 60);

    putText(menuText1, sf::Vector2f(1617, 97));
    menuText1.setString(L"Wróć");

    itemNameText.setFont(font);
    itemNameText.setCharacterSize(24);
    itemNameText.setFillColor(sf::Color::White);
    itemNameText.setPosition(sf::Vector2f(1300, 495));

    descriptionText.setFont(descrFont);
    descriptionText.setCharacterSize(18);
    descriptionText.setFillColor(sf::Color::White);
    descriptionText.setPosition(sf::Vector2f(1300, 520));
    chosenItemSprite.setScale(3.f, 3.f);
}

void InventoryScene::loadScenery()
{
    for (const auto &item : playerStats.getInventory())
    {
        sf::Texture texture;
        if (!textures.count(item.getAssetPath()))
        { // Load texture if not already loaded
            if (texture.loadFromFile(item.getAssetPath()))
            {
                textures[item.getAssetPath()] = texture;
            }
        }
    }

    float x = 156;
    float y = 270;
    for (const auto &item : playerStats.getInventory())
    {
        sf::Sprite sprite;
        sprite.setTexture(textures[item.getAssetPath()]);
        sprite.setPosition(x, y);
        sprite.setScale(64.f / sprite.getTexture()->getSize().x, 64.f / sprite.getTexture()->getSize().y);
        itemSprites.push_back(sprite);

        sf::Text quantityText;
        quantityText.setFont(font);
        quantityText.setCharacterSize(16);
        quantityText.setFillColor(sf::Color::White);
        sf::FloatRect spriteBounds = sprite.getGlobalBounds();
        quantityText.setPosition(spriteBounds.left + spriteBounds.width - 20, spriteBounds.top + spriteBounds.height - 20); // Adjust for exact positioning
        quantityText.setString(std::to_string(item.getQuantity()));
        itemQuantityTexts.push_back(quantityText);

        sf::CircleShape quantityCircle(10);
        quantityCircle.setFillColor(sf::Color(0, 0, 0, 150));
        quantityCircle.setPosition(quantityText.getPosition().x - 10, quantityText.getPosition().y - 10);
        quantityCircles.push_back(quantityCircle);

        x += 114;
    }

    // Load border
    sf::Texture borderTexture;
    if (!borderTexture.loadFromFile("assets/img/ui/item_chosen.png"))
    {
        std::cerr << "Error loading border texture" << std::endl;
    }
    textures["border"] = borderTexture;
    borderSprite.setTexture(textures["border"]);
    borderSprite.setColor(sf::Color(255, 255, 255, 0));
    borderSprite.setScale(1.55f, 1.55f);

    // Load sounds
    if (!initSoundBuffer.loadFromFile("assets/audio/music/inventory_open.wav"))
    {
        std::cerr << "Error: init sound" << std::endl;
    }
    initSound.setBuffer(initSoundBuffer);
    initSound.setVolume(30);
    initSound.play();

    if (!selectSoundBuffer.loadFromFile("assets/audio/music/inventory_select.wav"))
    {
        std::cerr << "Error: select sound" << std::endl;
    }
    selectSound.setVolume(30);
    selectSound.setBuffer(selectSoundBuffer);
}

void InventoryScene::putText(sf::Text &text, sf::Vector2f position)
{
    text.setFont(font);
    text.setCharacterSize(18);
    text.setFillColor(sf::Color::White);
    text.setStyle(sf::Text::Bold);
    text.setPosition(position);
}

void InventoryScene::handleInput(sf::Event event)
{
    // Calculate time elapsed and restart the clock
    // float deltaTime = clock.restart().asSeconds();
    clock.restart();

    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Escape))
    {
        manager.goToPrevScene(window, clock, playerStats);
        return;
    }

    // if mouse hovers over an item, display its description
    for (size_t i = 0; i < itemSprites.size(); i++)
    {
        if (itemSprites[i].getGlobalBounds().contains(sf::Mouse::getPosition(window).x, sf::Mouse::getPosition(window).y))
        {
            if (size_t(selectedItemIndex) != i)
            {
                selectSound.play();
            }
            descriptionText.setString(playerStats.getInventory()[i].getLDescription());
            selectedItemIndex = i;
            borderSprite.setPosition(itemSprites[i].getPosition().x - 25, itemSprites[i].getPosition().y - 23);

            chosenItemSprite.setTexture(textures[playerStats.getInventory()[i].getAssetPath()]);
            chosenItemSprite.setPosition(1400, 270);
            chosenItemSprite.setScale(160.f / chosenItemSprite.getTexture()->getSize().x, 160.f / chosenItemSprite.getTexture()->getSize().y);
            itemNameText.setString(playerStats.getInventory()[i].getName());
            break;
        }
        else
        {
            descriptionText.setString("");
            selectedItemIndex = -1;
        }
    }
}

void InventoryScene::update()
{
    staticCamera.update(window);

    if (selectedItemIndex != -1) // Fade in
    {
        if (borderAlpha < 255)
        {
            borderAlpha += 5;
        }
    }
    else // Fade out
    {
        if (borderAlpha > 0)
        {
            borderAlpha -= 5;
        }
    }
    borderSprite.setColor(sf::Color(255, 255, 255, static_cast<sf::Uint8>(borderAlpha)));
}

void InventoryScene::render()
{

    // Render
    window.clear(); // Clear old frame

    window.draw(background.getSprite()); // Draw the background first
    window.draw(mainText);
    window.draw(menuText1);

    for (auto &sprite : itemSprites)
    {
        window.draw(sprite);
    }

    for (size_t i = 0; i < itemQuantityTexts.size(); i++)
    {
        window.draw(quantityCircles[i]);
        window.draw(itemQuantityTexts[i]);
    }

    if (selectedItemIndex != -1)
    {
        window.draw(borderSprite);
        window.draw(itemNameText);
        window.draw(chosenItemSprite);
        window.draw(descriptionText);
    }
}

void InventoryScene::cleanup()
{
}
