package org.habemusrex.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.enemyLogic.BattleLogic;
import org.habemusrex.entities.Player;
import org.habemusrex.entities.Territory;

import java.util.Objects;
import java.util.Random;

public class BattleMenu extends VBox {
    private final GameSessionData gameSessionData;
    private final BattleLogic battleLogic;
    private Runnable onBattleEndCallback;

    public BattleMenu(GameSessionData gameSessionData) {
        super();
        setStyle("-fx-background-color: rgba(39, 26, 12, 0.8);");
        setPadding(new Insets(20));
        StackPane.setMargin(this, new Insets(0, 0, 0, 350));
        setMaxWidth(400);
        setTranslateX(0);
        setTranslateY(50);
        setVisible(false);
        this.gameSessionData = gameSessionData;
        this.battleLogic = new BattleLogic(gameSessionData);
    }
    public void openMenu(GameSessionData gameSessionData, int enemyId, Territory territory) {
        Random rand = new Random();
        getChildren().clear();
        StackPane.setAlignment(BattleMenu.this, Pos.TOP_RIGHT);
        Label nameLabel = new Label("A WIĘC WOJNA");
        nameLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 36));
        nameLabel.setStyle("-fx-text-fill: white;");
        nameLabel.setWrapText(true);
        nameLabel.setMouseTransparent(true);
        nameLabel.setMaxWidth(Double.MAX_VALUE);
        nameLabel.setAlignment(Pos.CENTER);
        nameLabel.setTranslateY(-30);

        // Territory description
        Label descriptionLabel = new Label("Twoi dzielni zołnierze szykują się do natarcia.");
        descriptionLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 18));
        descriptionLabel.setStyle("-fx-text-fill: white;");
        descriptionLabel.setWrapText(true);
        descriptionLabel.setMaxWidth(350);
        descriptionLabel.setAlignment(Pos.CENTER);
        descriptionLabel.setTranslateY(-40);

        Image battleImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/battle/beforeBattle.png")));
        ImageView battleImageView = new ImageView(battleImage);
        battleImageView.setFitWidth(350);
        battleImageView.setPreserveRatio(true);
        battleImageView.setStyle("-fx-border-color: black; -fx-border-width: 3; " +
                "-fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        battleImageView.setTranslateY(-40);


        StackPane imageContainer = new StackPane(battleImageView);
        imageContainer.setAlignment(Pos.CENTER);

        Button closeButton = getCloseButton();

        VBox playerArmyInfo = new VBox();
        playerArmyInfo.setSpacing(5);
        playerArmyInfo.setPrefWidth(180);
        playerArmyInfo.setMaxWidth(180);

        Text name = new Text("Twoja armia");
        name.setStyle("-fx-fill: white; -fx-font-size: 16; -fx-font-family: 'Pirata One';");

        StringBuilder numberOfUnits = new StringBuilder("Liczba jednostek: ");
        Integer count = gameSessionData.getTotalUnitsOf(gameSessionData.getCurrentPlayer().getPlayerId());
        numberOfUnits.append(count);
        Text numberOfUnitsText = new Text(numberOfUnits.toString());
        numberOfUnitsText.setStyle("-fx-fill: white; -fx-font-size: 14; -fx-font-family: 'Almendra';");

        StringBuilder offensiveStrength = new StringBuilder("Całkowita siła bojowa: ");
        Integer offensiveStrengthInteger = gameSessionData.getOffensiveStrengthFor(gameSessionData.getCurrentPlayer().getPlayerId());
        offensiveStrength.append(offensiveStrengthInteger);
        Text offensiveStrengthText = new Text(offensiveStrength.toString());
        offensiveStrengthText.setStyle("-fx-fill: white; -fx-font-size: 14; -fx-font-family: 'Almendra';");

        playerArmyInfo.getChildren().addAll(name, numberOfUnitsText, offensiveStrengthText);

        VBox enemyArmyInfo = new VBox();
        enemyArmyInfo.setSpacing(5);
        enemyArmyInfo.setPrefWidth(180);
        enemyArmyInfo.setMaxWidth(180);

        Text enemy = new Text("Przeciwnik");
        enemy.setStyle("-fx-fill: white; -fx-font-size: 16; -fx-font-family: 'Pirata One';");

        StringBuilder numberOfUnitsEnemy = new StringBuilder("Liczba jednostek: ");
        int enemyCount = gameSessionData.getTotalUnitsOf(gameSessionData.getCurrentPlayer().getPlayerId());

        double enemyCountL = enemyCount*(rand.nextDouble()-0.1);
        int enemyCountEstimated = (int) enemyCountL;
        numberOfUnitsEnemy.append(enemyCountEstimated);
        numberOfUnitsEnemy.append(" ~ ");
        double enemyCountH = enemyCount*(rand.nextDouble()+1);
        enemyCountEstimated = (int) enemyCountH;
        numberOfUnitsEnemy.append(enemyCountEstimated);
        Text numberOfUnitsEnemyText = new Text(numberOfUnitsEnemy.toString());
        numberOfUnitsEnemyText.setStyle("-fx-fill: white; -fx-font-size: 14; -fx-font-family: 'Almendra';");

        StringBuilder defensiveStrengthEnemy = new StringBuilder("Całkowita siła obronna: ");
        int defensiveStrength = gameSessionData.getOffensiveStrengthFor(enemyId);
        double strength = defensiveStrength*(rand.nextDouble()-0.1);
        int defensiveStrengthEstimated = (int) strength;
        defensiveStrengthEnemy.append(defensiveStrengthEstimated);
        defensiveStrengthEnemy.append(" ~ ");
        strength = defensiveStrength*(rand.nextDouble()+1);
        defensiveStrengthEstimated = (int) strength;
        defensiveStrengthEnemy.append(defensiveStrengthEstimated);

        Text defensiveEnemy = new Text(defensiveStrengthEnemy.toString());
        defensiveEnemy.setStyle("-fx-fill: white; -fx-font-size: 14; -fx-font-family: 'Almendra';");

        enemyArmyInfo.getChildren().addAll(enemy, numberOfUnitsEnemyText, defensiveEnemy);

        HBox battleInfo = new HBox();
        battleInfo.setSpacing(25);
        battleInfo.setPrefWidth(350);
        battleInfo.setMaxWidth(350);
        battleInfo.setAlignment(Pos.CENTER);
        battleInfo.getChildren().addAll(playerArmyInfo, enemyArmyInfo);

        Button attackButton = new Button("DO ATAKU!");
        attackButton.setStyle("-fx-background-color: rgb(39, 26, 12); -fx-text-fill: white; " +
                "-fx-font-size: 16; -fx-font-family: 'Pirata One'; -fx-position: absolute;");
        attackButton.setOnAction(event ->
                showSummary(gameSessionData.getCurrentPlayer(), enemyId, territory));

        Button retreatButton = new Button("ODWRÓT!");
        retreatButton.setStyle("-fx-background-color: rgb(39, 26, 12); -fx-text-fill: white; " +
                "-fx-font-size: 16; -fx-font-family: 'Pirata One'; -fx-position: absolute;");
        retreatButton.setOnAction(event -> closeMenu());

        HBox buttonContainer = new HBox(attackButton, retreatButton);
        buttonContainer.setSpacing(25);
        buttonContainer.setAlignment(Pos.BOTTOM_CENTER);

        getChildren().addAll(closeButton, nameLabel, descriptionLabel, imageContainer, battleInfo, buttonContainer);

        setVisible(true);
    }

    public void showSummary(Player player, int enemy_id, Territory territory) {
        int result = battleLogic.executeBattle(player, enemy_id, territory);
        if (onBattleEndCallback != null) {
            onBattleEndCallback.run();
        }
        getChildren().clear();
        StackPane.setAlignment(BattleMenu.this, Pos.TOP_RIGHT);
        Label nameLabel;
        Label descriptionLabel;
        ImageView battleImageView;
        if (result == 1) {
            nameLabel = new Label("ZWYCIĘSTWO");
            descriptionLabel = new Label("Twoi żołnierze zwyciężyli i zajęli miasto przeciwnika");
            Image battleImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/battle/victory.png")));
            battleImageView = new ImageView(battleImage);
        }
        else if (result == 0) {
            nameLabel = new Label("BITWA NIEROZSTRZYGNIĘTA");
            descriptionLabel = new Label("Siły obu armii były wyrównane");
            Image battleImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/battle/beforeBattle.png")));
            battleImageView = new ImageView(battleImage);
        }
        else {
            nameLabel = new Label("PORAŻKA");
            descriptionLabel = new Label("Siły wroga okazały się przeważające");
            Image battleImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/battle/defeat.png")));
            battleImageView = new ImageView(battleImage);
        }
        nameLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 36));
        nameLabel.setStyle("-fx-text-fill: white;");
        nameLabel.setWrapText(true);
        nameLabel.setMouseTransparent(true);
        nameLabel.setMaxWidth(Double.MAX_VALUE);
        nameLabel.setAlignment(Pos.CENTER);
        nameLabel.setTranslateY(-30);

        descriptionLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 18));
        descriptionLabel.setStyle("-fx-text-fill: white;");
        descriptionLabel.setWrapText(true);
        descriptionLabel.setMaxWidth(350);
        descriptionLabel.setAlignment(Pos.CENTER);
        descriptionLabel.setTranslateY(-40);

        battleImageView.setFitWidth(350);
        battleImageView.setPreserveRatio(true);
        battleImageView.setStyle("-fx-border-color: black; -fx-border-width: 3; " +
                "-fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        battleImageView.setTranslateY(-40);

        StackPane imageContainer = new StackPane(battleImageView);
        imageContainer.setAlignment(Pos.CENTER);

        String playerLossInfo = "Twoje straty: " + battleLogic.getPlayerSoldierLoss() +
                " jednostek";
        Text playerInfo = new Text(playerLossInfo);
        playerInfo.setStyle("-fx-fill: white; -fx-font-size: 14; -fx-font-family: 'Almendra';");

        String enemyLossInfo = "Straty przeciwnika: " + battleLogic.getEnemySoldierLoss()+
                " jednostek";
        Text enemyInfo = new Text(enemyLossInfo);
        enemyInfo.setStyle("-fx-fill: white; -fx-font-size: 14; -fx-font-family: 'Almendra';");

        Button closeButtonSummary = getCloseButton();

        Button okButton = new Button("Rozumiem");
        okButton.setStyle("-fx-background-color: rgb(39, 26, 12); -fx-text-fill: white; " +
                "-fx-font-size: 16; -fx-font-family: 'Pirata One'; -fx-position: absolute;");
        okButton.setOnAction(event -> closeMenu());

        HBox buttonContainerSummary = new HBox(okButton);
        buttonContainerSummary.setSpacing(25);
        buttonContainerSummary.setAlignment(Pos.BOTTOM_CENTER);

        getChildren().addAll(closeButtonSummary, imageContainer, nameLabel, descriptionLabel, playerInfo, enemyInfo, buttonContainerSummary);

        setVisible(true);
    }
    private void closeMenu() {
        setVisible(false);
    }

    private Button getCloseButton() {
        Button closeButton = new Button("X");
        closeButton.setStyle("-fx-background-color: transparent; " +
                "-fx-text-fill: white; " +
                "-fx-font-size: 22; " +
                "-fx-border-color: transparent; " +
                "fx-position: absolute; " +
                "-fx-font-family: 'Pirata One';");
        closeButton.setOnMouseEntered(event -> closeButton.setTextFill(Color.rgb(179, 134, 0)));
        closeButton.setOnMouseExited(event -> closeButton.setTextFill(Color.WHITE));
        closeButton.setOnAction(event -> closeMenu());
        return closeButton;
    }

    public void setOnBattleEndCallback(Runnable callback) {
        this.onBattleEndCallback = callback;
    }
}
