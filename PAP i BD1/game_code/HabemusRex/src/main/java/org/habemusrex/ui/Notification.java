package org.habemusrex.ui;

import javafx.animation.FadeTransition;
import javafx.animation.PauseTransition;
import javafx.animation.SequentialTransition;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.TextAlignment;
import javafx.util.Duration;

public class Notification extends VBox {
    private static final double DEFAULT_SHOW_TIME_SECONDS = 3.0;
    private static final double FADE_TIME_SECONDS = 0.5;

    // Transition
    private SequentialTransition showHideTransition;

    public Notification() {
        super(10);
        setPrefWidth(300);
        setMaxWidth(300);
        setMaxHeight(100);
        setPadding(new Insets(15));

        setStyle("-fx-background-color: rgba(39, 26, 12, 0.95); " +
                "-fx-border-color: rgb(179, 134, 0); " +
                "-fx-border-width: 2; " +
                "-fx-background-radius: 10; " +
                "-fx-border-radius: 10; " +
                "-fx-effect: dropshadow(three-pass-box, rgba(0,0,0,0.6), 10, 0, 0, 0);");

        setTranslateY(70);
        setAlignment(Pos.CENTER);

        // Start invisible
        setOpacity(0);
        setMouseTransparent(true);
    }

    public void show(String title, String message) {
        getChildren().clear();

        Label titleLabel = new Label(title);
        titleLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 20));
        titleLabel.setStyle("-fx-text-fill: rgb(179, 134, 0);");
        titleLabel.setWrapText(true);
        titleLabel.setTextAlignment(TextAlignment.CENTER);
        titleLabel.setMaxWidth(280);

        Label messageLabel = new Label(message);
        messageLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 16));
        messageLabel.setStyle("-fx-text-fill: white;");
        messageLabel.setWrapText(true);
        messageLabel.setTextAlignment(TextAlignment.CENTER);
        messageLabel.setMaxWidth(280);

        getChildren().addAll(titleLabel, messageLabel);

        // Fade-in animation
        FadeTransition fadeIn = new FadeTransition(Duration.seconds(FADE_TIME_SECONDS), this);
        fadeIn.setFromValue(0);
        fadeIn.setToValue(1);

        // Display transition
        PauseTransition display = new PauseTransition(Duration.seconds(DEFAULT_SHOW_TIME_SECONDS));

        // Fade-out animation
        FadeTransition fadeOut = new FadeTransition(Duration.seconds(FADE_TIME_SECONDS), this);
        fadeOut.setFromValue(1);
        fadeOut.setToValue(0);

        // If there's an existing transition, stop it
        if (showHideTransition != null) {
            showHideTransition.stop();
        }

        // Play the animations
        showHideTransition = new SequentialTransition(fadeIn, display, fadeOut);
        showHideTransition.play();
    }

    public void show(String title, String message, double showTimeSeconds) {
        if (showHideTransition != null) {
            showHideTransition.stop();
        }

        show(title, message);

        showHideTransition.getChildren().set(1, new PauseTransition(Duration.seconds(showTimeSeconds)));
        showHideTransition.play();
    }
}