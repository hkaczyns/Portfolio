package org.habemusrex.ui;

import javafx.animation.Interpolator;
import javafx.animation.TranslateTransition;
import javafx.scene.Group;
import javafx.scene.image.Image;
import javafx.scene.paint.ImagePattern;
import javafx.scene.shape.Circle;
import javafx.util.Duration;
import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.entities.*;

import java.util.List;
import java.util.Objects;

public class NextTurnButton extends Group {

    private final Circle nextTurnButton;
    private int turn;
    private final Runnable onNextTurn;
    private final GameSessionData sessionData; // Add GameSessionData as a dependency
    private final ResultMenu resultMenu;
    private final Notification notification;

    public NextTurnButton(int initialTurn, Runnable onNextTurnCallback,
                          GameSessionData sessionData, ResultMenu resultMenu, boolean isTest,
                          Notification notification) {
        this.turn = initialTurn;
        this.onNextTurn = onNextTurnCallback;
        this.sessionData = sessionData;
        this.resultMenu = resultMenu;
        this.notification = notification;

        // Background circle
        Image backgroundTurnImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/ui/next_turn_background.png")));
        Circle backgroundCircle = new Circle(90);
        backgroundCircle.setFill(new ImagePattern(backgroundTurnImage));
        backgroundCircle.setStyle("-fx-effect: dropshadow(three-pass-box, black, 15, 0.5, 0, 0);");

        // Next turn button
        Image nextTurnImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/ui/next_turn.png")));
        nextTurnButton = new Circle(70);
        nextTurnButton.setFill(new ImagePattern(nextTurnImage));
        nextTurnButton.setStyle("-fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0); " +
                "-fx-border-color: rgb(179, 134, 0); -fx-border-width: 50;");

        // Button hover
        nextTurnButton.setOnMouseEntered(event -> {
            nextTurnButton.setScaleX(1.02);
            nextTurnButton.setScaleY(1.02);
        });
        nextTurnButton.setOnMouseExited(event -> {
            nextTurnButton.setScaleX(1.0);
            nextTurnButton.setScaleY(1.0);
        });

        // Button click
        nextTurnButton.setOnMouseClicked(event -> handleNextTurn());

        getChildren().addAll(backgroundCircle, nextTurnButton);
        if (!isTest) {
            addAnimation();
        }
    }

    public void handleNextTurn() {
        turn++;
        updatePlayerResources(); // Update player resources at the end of the turn

        // Update points
        sessionData.updateScores();

        Player nearVictor = sessionData.checkForNearVictory();
        if (nearVictor != null) {
            notification.show(
                    "UWAGA!",
                    nearVictor.getFraction().getName() + " jest o krok od zwycięstwa!",
                    5.0
            );
        }

        // Check if the game is over
        Player winner = sessionData.checkForWinner();
        if (winner != null) {
            System.out.println("Victory achieved by " + winner.getFraction().getName() +
                    " with " + sessionData.getPlayerScore(winner.getPlayerId()) + " points!");

            // Show the victory screen
            resultMenu.showVictoryScreen(winner);
        }

        if (onNextTurn != null) {
            onNextTurn.run();
        }
        System.out.println("Next turn: " + turn);
        for (PlayerResource playerResource : sessionData.getCurrentPlayerResources()) {
            String resourceName = playerResource.getResource().getName();
            int quantity = playerResource.getQuantity();
            System.out.println("Resource: " + resourceName + ", Quantity: " + quantity + " Player: " + playerResource.getPlayer().getPlayerId());
        }
    }

    public void updatePlayerResources() {
        List<Construction> constructions = sessionData.getConstructions();

        for (Construction construction : constructions) {
            BuildingInfo building = construction.getBuilding();
            TerritoryOwnership ownership = sessionData.getOwnership(construction.getTerritory().getTerritoryId());
            Player player = ownership.getPlayer();

            boolean canAfford = true;
            List<BuildingUpkeep> upkeeps = StaticDataCache.getUpkeepsForBuilding(building.getBuildingId());
            for (BuildingUpkeep upkeep : upkeeps) {
                int toBePayed = upkeep.getUpkeep();
                int available = sessionData.getResourcesOf(player.getPlayerId(), upkeep.getResource().getResourceId());
                if (toBePayed > available) {
                    canAfford = false;
                    break;
                }
            }
            if (canAfford) {
                // Apply production
                List<BuildingProduction> productions = StaticDataCache.getProductionsForBuilding(building.getBuildingId());
                for (BuildingProduction production : productions) {
                    sessionData.addPlayerResource(player, production.getResource(), production.getProduction());
                }

                // Apply upkeep
                upkeeps = StaticDataCache.getUpkeepsForBuilding(building.getBuildingId());
                for (BuildingUpkeep upkeep : upkeeps) {
                    sessionData.subtractPlayerResource(player, upkeep.getResource(), upkeep.getUpkeep());
                }
            }
        }
    }

    private void addAnimation() {
        TranslateTransition hoverAnimation = new TranslateTransition(Duration.seconds(2), this);
        hoverAnimation.setFromY(0);
        hoverAnimation.setToY(10);
        hoverAnimation.setInterpolator(Interpolator.EASE_BOTH);
        hoverAnimation.setCycleCount(TranslateTransition.INDEFINITE);
        hoverAnimation.setAutoReverse(true);
        hoverAnimation.play();
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }

    public int getTurn() {
        return turn;
    }
}
