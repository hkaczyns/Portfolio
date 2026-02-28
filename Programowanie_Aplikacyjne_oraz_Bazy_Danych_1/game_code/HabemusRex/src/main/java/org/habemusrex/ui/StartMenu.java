package org.habemusrex.ui;

import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.Background;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;

import java.util.Objects;

public class StartMenu extends StackPane {

    private Button playButton;
    private Button exitButton;

    public StartMenu() {
        initialize();
    }

    private void initialize() {
        this.setBackground(Background.fill(Color.rgb(39, 26, 12)));

        ImageView background = new ImageView(new Image(
                Objects.requireNonNull(getClass().getResourceAsStream("/img/backgrounds/startmenu.png"))
        ));

        background.setPreserveRatio(false);
        background.setFitWidth(1280);
        background.setFitHeight(720);

        Font font = Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 24);


        VBox buttonContainer = new VBox(20);
        buttonContainer.setAlignment(Pos.CENTER);

        playButton = new Button("GRAJ");
        playButton.setStyle("-fx-font-size: 24px; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0); " +
                        "-fx-background-color: rgb(39, 26, 12); -fx-border-color: rgb(179, 134, 0);" +
                        "-fx-border-color: rgb(179, 134, 0); -fx-border-width: 2; -fx-border-radius: 10; -fx-background-radius: 10;" +
                        "-fx-font-family: 'Pirata One';");
        playButton.setFont(font);
        playButton.setPrefSize(150, 60);
        playButton.setTextFill(Color.rgb(255, 255, 255));
        playButton.setOnMouseEntered(event -> playButton.setTextFill(Color.rgb(179, 134, 0)));
        playButton.setOnMouseExited(event -> playButton.setTextFill(Color.rgb(255, 255, 255)));

        exitButton = new Button("WYJDŹ");
        exitButton.setStyle("-fx-font-size: 16px; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0); " +
                "-fx-background-color: rgb(39, 26, 12); -fx-border-color: rgb(179, 134, 0);" +
                "-fx-border-color: rgb(179, 134, 0); -fx-border-width: 2; -fx-border-radius: 10; -fx-background-radius: 10;" +
                "-fx-font-family: 'Pirata One';");
        exitButton.setFont(font);
        exitButton.setPrefSize(100, 30);
        exitButton.setOnAction(event -> {
            System.out.println("Thanks for playing Habemus Rex!");
            System.exit(0);
        });
        exitButton.setTextFill(Color.rgb(255, 255, 255));
        exitButton.setOnMouseEntered(event -> exitButton.setTextFill(Color.rgb(179, 134, 0)));
        exitButton.setOnMouseExited(event -> exitButton.setTextFill(Color.rgb(255, 255, 255)));

        buttonContainer.getChildren().addAll(playButton, exitButton);
        this.getChildren().addAll(background, buttonContainer);
        StackPane.setAlignment(playButton, Pos.CENTER);
    }

    public Button getPlayButton() {
        return playButton;
    }
}
