package org.habemusrex.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.scene.text.TextAlignment;
import org.habemusrex.entities.Player;

import java.util.Objects;

public class ResultMenu extends StackPane {
    private final ExitMenu exitMenu;
    private final Runnable onPlayOnCallback;

    public ResultMenu(ExitMenu exitMenu, Runnable onPlayOnCallback) {
        this.exitMenu = exitMenu;
        this.onPlayOnCallback = onPlayOnCallback;

        VBox screenContainer = new VBox(20);
        screenContainer.setAlignment(Pos.CENTER);
        screenContainer.setStyle("-fx-background-color: rgba(0, 0, 0, 0.7);");

        VBox resultMenuContainer = new VBox(20);
        resultMenuContainer.setAlignment(Pos.CENTER);
        resultMenuContainer.setStyle("-fx-background-color: rgba(39, 26, 12, 0.95); " +
                "-fx-padding: 40; " +
                "-fx-border-color: rgb(179, 134, 0); " +
                "-fx-border-width: 3; " +
                "-fx-border-radius: 10; " +
                "-fx-background-radius: 10;");
        resultMenuContainer.setMaxWidth(600);
        resultMenuContainer.setMaxHeight(400);

        // Victory label
        Label victoryLabel = new Label("ZWYCIĘSTWO!");
        victoryLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 48));
        victoryLabel.setStyle("-fx-text-fill: gold; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        victoryLabel.setTextAlignment(TextAlignment.CENTER);
        victoryLabel.setWrapText(true);

        // Winner text
        Label winnerLabel = new Label();
        winnerLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 24));
        winnerLabel.setStyle("-fx-text-fill: white; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        winnerLabel.setTextAlignment(TextAlignment.CENTER);
        winnerLabel.setWrapText(true);

        HBox buttonContainer = new HBox(20);
        buttonContainer.setAlignment(Pos.CENTER);
        buttonContainer.setPadding(new Insets(20, 0, 0, 0));

        // Menu button
        Button menuButton = createResultExitButton("Menu");
        menuButton.setOnAction(event -> exitMenu.show());

        // Play On button
        Button playOnButton = createResultExitButton("Graj dalej");
        playOnButton.setOnAction(event -> {
            if (onPlayOnCallback != null) {
                onPlayOnCallback.run();
            }
            setVisible(false);
        });

        buttonContainer.getChildren().addAll(menuButton, playOnButton);

        resultMenuContainer.getChildren().addAll(victoryLabel, winnerLabel, buttonContainer);
        screenContainer.getChildren().add(resultMenuContainer);

        try {
            Image backgroundImage = new Image(Objects.requireNonNull(
                    getClass().getResourceAsStream("/img/backgrounds/startmenu.png")));
            BackgroundImage background = new BackgroundImage(
                    backgroundImage,
                    BackgroundRepeat.NO_REPEAT,
                    BackgroundRepeat.NO_REPEAT,
                    BackgroundPosition.CENTER,
                    new BackgroundSize(100, 100, true, true, true, true)
            );
            setBackground(new Background(background));
        } catch (Exception e) {
            System.out.println("Could not load victory background image");
        }

        getChildren().addAll(screenContainer);
        setVisible(false);
    }

    private Button createResultExitButton(String text) {
        Button button = new Button(text);
        button.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 18));
        button.setStyle("-fx-background-color: #d4af37; " +
                "-fx-text-fill: black; " +
                "-fx-border-radius: 5; " +
                "-fx-background-radius: 5; " +
                "-fx-min-width: 150;");
        return button;
    }

    public void showVictoryScreen(Player winner) {
        Label winnerLabel = (Label) ((VBox) ((VBox) getChildren().get(0)).getChildren().get(0)).getChildren().get(1);
        winnerLabel.setText(winner.getFraction().getName() + " odnosi zwycięstwo!");
        setVisible(true);
    }
}