package org.habemusrex.ui;

import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.TextAlignment;

public class ExitMenu extends StackPane {

    private final Runnable onSaveAndExitCallback;
    private final Runnable onSaveCallback;

    public ExitMenu(Runnable onSaveAndExitCallback, Runnable onSaveCallback) {
        this.onSaveAndExitCallback = onSaveAndExitCallback;
        this.onSaveCallback = onSaveCallback;

        VBox screenContainer = new VBox(20);
        screenContainer.setAlignment(Pos.CENTER);
        screenContainer.setStyle("-fx-background-color: rgba(39, 26, 12, 0.4); -fx-padding: 20; -fx-border-radius: 10; -fx-background-radius: 10;");

        VBox exitMenuContainer = new VBox(20);
        exitMenuContainer.setAlignment(Pos.CENTER);
        exitMenuContainer.setStyle("-fx-background-color: rgba(39, 26, 12, 1); -fx-padding: 20; -fx-border-radius: 10; -fx-background-radius: 10;");
        exitMenuContainer.setMinWidth(300);
        exitMenuContainer.setMaxWidth(300);
        Button closeButton = new Button("X");
        closeButton.setStyle("-fx-background-color: transparent; " +
                "-fx-text-fill: white; " +
                "-fx-font-size: 22; " +
                "-fx-border-color: transparent; " +
                "fx-position: absolute; " +
                "-fx-font-family: 'Pirata One';");
        closeButton.setOnMouseEntered(event -> closeButton.setTextFill(Color.rgb(179, 134, 0)));
        closeButton.setOnMouseExited(event -> closeButton.setTextFill(Color.WHITE));
        closeButton.setOnAction(event -> close());
        closeButton.setAlignment(Pos.TOP_RIGHT);

        StackPane closeButtonContainer = new StackPane(closeButton);
        closeButtonContainer.setAlignment(Pos.TOP_RIGHT);


        Label thanksLabel = new Label("Habemus Rex");
        thanksLabel.setFont(new Font("Pirata One", 25));
        thanksLabel.setTextFill(Color.WHITE);
        thanksLabel.setTextAlignment(TextAlignment.CENTER);
        thanksLabel.setMouseTransparent(true);
        thanksLabel.setTranslateY(-40);

        Button saveGameButton = new Button("Zapisz grę");
        saveGameButton.setFont(new Font("Pirata One", 18));
        saveGameButton.setStyle("-fx-background-color: #d4af37; -fx-text-fill: black; -fx-border-radius: 5; -fx-background-radius: 5;");
        saveGameButton.setOnAction(event -> onSaveCallback.run());

        Button saveAndExitGameButton = new Button("Zapisz i wyjdź");
        saveAndExitGameButton.setFont(new Font("Pirata One", 18));
        saveAndExitGameButton.setStyle("-fx-background-color: #d4af37; -fx-text-fill: black; -fx-border-radius: 5; -fx-background-radius: 5;");
        saveAndExitGameButton.setOnAction(event -> onSaveAndExitCallback.run());

        Button exitGameButton = new Button("Wyjdź bez zapisywania");
        exitGameButton.setFont(new Font("Pirata One", 18));
        exitGameButton.setStyle("-fx-background-color: #d4af37; -fx-text-fill: black; -fx-border-radius: 5; -fx-background-radius: 5;");
        exitGameButton.setOnAction(event -> {
            System.out.println("Closing without saving.");
            System.out.println("Thanks for playing Habemus Rex!");
            System.exit(0);
        });

        exitMenuContainer.getChildren().addAll(closeButtonContainer, thanksLabel, saveGameButton, saveAndExitGameButton, exitGameButton);
        screenContainer.getChildren().addAll(exitMenuContainer);



        getChildren().add(screenContainer);


        setAlignment(screenContainer, Pos.CENTER);

        setVisible(false);
    }

    public void show() {
        setVisible(true);
    }

    public void close() {
        setVisible(false);
    }
}
