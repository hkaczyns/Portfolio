package org.habemusrex.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.entities.Player;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public class ScoreboardMenu extends VBox {
    private final GameSessionData sessionData;

    public ScoreboardMenu(GameSessionData sessionData) {
        super(10);
        this.sessionData = sessionData;

        setPadding(new Insets(20));
        setStyle("-fx-background-color: rgba(39, 26, 12, 0.8);");
        setMaxWidth(350);

        StackPane.setMargin(this, new Insets(0, 0, 0, 350));
        setTranslateY(50);
        setVisible(false);

        // Close button
        Button closeButton = getCloseButton();
        getChildren().add(closeButton);

        // Title
        Label titleLabel = new Label("PUNKTACJA");
        titleLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 36));
        titleLabel.setStyle("-fx-text-fill: white; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        titleLabel.setMaxWidth(Double.MAX_VALUE);
        titleLabel.setAlignment(Pos.CENTER);
        getChildren().add(titleLabel);
    }

    public void updateScoreboard() {
        // Clear existing score entries (keep the title)
        getChildren().subList(2, getChildren().size()).clear();

        // Sort players by score
        List<Player> sortedPlayers = sessionData.getPlayers().stream()
                .sorted(Comparator.comparingInt(p -> -sessionData.getPlayerScore(p.getPlayerId())))
                .toList();

        // Add scores for all players
        for (Player player : sortedPlayers) {
            HBox scoreEntry = createScoreEntry(player);
            getChildren().add(scoreEntry);
        }

        // Add details for current player
        addCurrentPlayerDetails();
    }

    private HBox createScoreEntry(Player player) {
        HBox entry = new HBox(10);
        entry.setAlignment(Pos.CENTER_LEFT);
        entry.setPadding(new Insets(5, 10, 5, 10));
        entry.setStyle("-fx-background-color: rgba(77, 51, 25, 0.6); -fx-background-radius: 5;");

        // Player fraction name
        Label nameLabel = new Label(player.getFraction().getName());
        nameLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 18));
        nameLabel.setStyle("-fx-text-fill: white;");
        HBox.setHgrow(nameLabel, Priority.ALWAYS);

        // Score
        Label scoreLabel = new Label(String.valueOf(sessionData.getPlayerScore(player.getPlayerId())));
        scoreLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 18));
        scoreLabel.setStyle("-fx-text-fill: gold;");

        entry.getChildren().addAll(nameLabel, scoreLabel);

        // Highlight current player
        if (Objects.equals(player.getPlayerId(), sessionData.getCurrentPlayer().getPlayerId())) {
            entry.setStyle(entry.getStyle() + "; -fx-border-color: gold; -fx-border-width: 2; -fx-border-radius: 5;");
        }

        return entry;
    }

    private void addCurrentPlayerDetails() {
        Player currentPlayer = sessionData.getCurrentPlayer();

        // Details
        Label detailsTitle = new Label("SZCZEGÓŁY PUNKTACJI");
        detailsTitle.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 20));
        detailsTitle.setStyle("-fx-text-fill: white;");
        detailsTitle.setPadding(new Insets(20, 0, 10, 0));

        // Territory points info
        int territoryCount = sessionData.getTerritoriesOf(currentPlayer.getPlayerId()).size();
        Label territoryPoints = new Label("Terytoria: " + territoryCount);
        territoryPoints.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 16));
        territoryPoints.setStyle("-fx-text-fill: white;");

        // Building points info
        int buildingCount = sessionData.getConstructions().stream()
                .filter(c -> Objects.equals(sessionData.getOwnership(c.getTerritory().getTerritoryId())
                        .getPlayer().getPlayerId(), currentPlayer.getPlayerId()))
                .toList().size();
        Label buildingPoints = new Label("Budynki: " + buildingCount);
        buildingPoints.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 16));
        buildingPoints.setStyle("-fx-text-fill: white;");

        getChildren().addAll(detailsTitle, territoryPoints, buildingPoints);
    }

    private Button getCloseButton() {
        Button closeButton = new Button("X");
        closeButton.setStyle("-fx-background-color: transparent; " +
                "-fx-text-fill: white; " +
                "-fx-font-size: 22; " +
                "-fx-border-color: transparent; " +
                "-fx-font-family: 'Pirata One';");
        closeButton.setOnMouseEntered(event -> closeButton.setTextFill(Color.rgb(179, 134, 0)));
        closeButton.setOnMouseExited(event -> closeButton.setTextFill(Color.WHITE));
        closeButton.setOnAction(event -> setVisible(false));
        return closeButton;
    }
}