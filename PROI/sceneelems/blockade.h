/**
 * Name: blockade.h
 * Purpose: class representing an invisible blockade that handles collision with the player
 * @authors Maciej Bogusławski, Hubert Kaczyński
 */

#include <SFML/Graphics.hpp>

class Blockade
{
public:
    Blockade(float width, float height, float posX, float posY, sf::Color color);
    ~Blockade();

    void draw(sf::RenderWindow &window);

    // getters
    float getX() const;
    float getY() const;
    float getWidth() const;
    float getHeight() const;

    void show();

    sf::RectangleShape rectangle;
};