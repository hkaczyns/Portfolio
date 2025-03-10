package org.habemusrex.ui;

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.text.Font;
import javafx.util.Duration;
import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.entities.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

public class TopBar extends HBox {

    private final Label turnLabel;
    private final Label timeLabel;
    private final Button menuButton;
    private final Button armyButton;
    private final Button scoreboardButton;
    private ScoreboardMenu scoreboardMenu;
    private final Button helpButton;
    private HelpMenu helpMenu;

    private final HashMap<String, Integer> resourceIncomes = new HashMap<>() {{
        put("Złoto", 0);
        put("Żelazo", 0);
        put("Drewno", 0);
        put("Kamień", 0);
        put("Jedzenie", 0);
    }};

    private final GameSessionData sessionData;

    private final List<Resource> resources;
    private final List<Label> resourceAmountLabels = new ArrayList<>();
    private final List<Label> incomeLabels = new ArrayList<>();

    public TopBar(GameSessionData sessionData) {
        super(20);
        this.sessionData = sessionData;

        resources = StaticDataCache.getResources();

        setPadding(new Insets(10));
        setStyle("-fx-border-color: rgb(179, 134, 0); -fx-border-width: 2; " +
                "-fx-background-color: linear-gradient(to bottom, rgba(77, 51, 25, 1), rgba(130, 84, 38, 1));" +
                "-fx-border-style: hidden hidden solid hidden;");
        setMaxHeight(50);

        // Game logo
        Image logoImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/logo/white.png")));
        ImageView logoView = new ImageView(logoImage);
        logoView.setFitHeight(30);
        logoView.setPreserveRatio(true);

        // Font
        Font pirataFont = Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 16);

        // Resources box
        HBox resourcesBox = createResourcesBox(pirataFont);

        // Turn number
        turnLabel = new Label("Tura 1");
        turnLabel.setFont(pirataFont);
        turnLabel.setStyle("-fx-text-fill: white;");
        turnLabel.setTranslateY(3);

        // Current time (hour:minute)
        timeLabel = new Label(LocalTime.now().toString().substring(0, 5));
        timeLabel.setFont(pirataFont);
        timeLabel.setStyle("-fx-text-fill: white;");
        timeLabel.setTranslateY(3);

        // Update time every second
        Timeline timeline = new Timeline(new KeyFrame(Duration.seconds(10), event ->
                timeLabel.setText(LocalTime.now().toString().substring(0, 5))
        ));
        timeline.setCycleCount(Timeline.INDEFINITE);
        timeline.play();

        // Army button
        armyButton = new Button("ARMIA");
        armyButton.setStyle("-fx-font-size: 14; -fx-background-color: #d4af37; " +
                "-fx-border-color: rgb(39, 26, 12); -fx-border-width: 1; " +
                "-fx-font-family: 'Pirata One'; -fx-text-fill: black;");
        armyButton.setMaxHeight(30);

        // Scoreboard button
        scoreboardButton = new Button("PUNKTACJA");
        scoreboardButton.setStyle("-fx-font-size: 14; -fx-background-color: #d4af37; " +
                "-fx-border-color: rgb(39, 26, 12); -fx-border-width: 1; " +
                "-fx-font-family: 'Pirata One'; -fx-text-fill: black;");
        scoreboardButton.setMaxHeight(30);

        // Help button
        helpButton = new Button("?");
        helpButton.setStyle("-fx-font-size: 14; -fx-background-color: rgb(39, 26, 12); " +
                "-fx-border-color: rgb(179, 134, 0); -fx-border-width: 1; " +
                "-fx-font-family: 'Pirata One'; -fx-text-fill: white;");
        helpButton.setMaxHeight(30);
        helpButton.setPrefWidth(30);

        // Menu button
        menuButton = new Button("MENU");
        menuButton.setStyle("-fx-font-size: 14; -fx-background-color: #d4af37; " +
                "-fx-border-color: rgb(39, 26, 12); -fx-border-width: 1; " +
                "-fx-font-family: 'Pirata One'; -fx-text-fill: black;");
        menuButton.setMaxHeight(30);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        // Add all components to the top bar
        getChildren().addAll(logoView, resourcesBox, armyButton, scoreboardButton, helpButton, spacer, turnLabel, timeLabel, menuButton);
    }

    private HBox createResourcesBox(Font font) {


        HBox resourcesBox = new HBox(5);
        for (Resource resource : resources) {
            String resourceName = resource.getName();

            Image resourceImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/resources/" + resource.getResourceImg())));
            ImageView resourceIcon = new ImageView(resourceImage);
            resourceIcon.setFitHeight(30);
            resourceIcon.setPreserveRatio(true);

            Label resourceAmount = new Label(sessionData.getCurrentPlayerResourceQuantity(resourceName).toString());
            resourceAmount.setFont(font);
            resourceAmount.setStyle("-fx-text-fill: white;");
            resourceAmount.setTranslateY(3);
            resourceAmountLabels.add(resourceAmount);

            // Increase-per-turn label
            Label increaseLabel = new Label("+" + resourceIncomes.get(resourceName));
            increaseLabel.setFont(font);
            increaseLabel.setStyle("-fx-text-fill: white; -fx-font-size: 12;");
            increaseLabel.setTranslateY(0);
            incomeLabels.add(increaseLabel);
            HBox.setMargin(increaseLabel, new Insets(0, 15, 0, 0));

            resourcesBox.getChildren().add(new HBox(5, resourceIcon, resourceAmount, increaseLabel));
        }
        return resourcesBox;
    }

    public void updateResources() {
        for (int i = 0; i < resources.size(); i++) {
            resourceAmountLabels.get(i).setText(sessionData.getCurrentPlayerResourceQuantity(resources.get(i).getName()).toString());
        }

        Territory constructionsTerritory;
        List<Construction> constructions = sessionData.getConstructions();
        List<Army> armies = sessionData.getArmyOfPlayer(sessionData.getCurrentPlayer().getPlayerId());
        TerritoryOwnership ownership;
        BuildingInfo building;

        resourceIncomes.put("Złoto", 0);
        resourceIncomes.put("Żelazo", 0);
        resourceIncomes.put("Drewno", 0);
        resourceIncomes.put("Kamień", 0);
        resourceIncomes.put("Jedzenie", 0);

        for (Construction construction : constructions) {
            constructionsTerritory = construction.getTerritory();
            ownership = sessionData.getOwnership(constructionsTerritory.getTerritoryId());
            if (ownership != null && ownership.getPlayer().getFraction().getFractionId() == 1) {
                building = construction.getBuilding();
                for (BuildingProduction prod : StaticDataCache.getProductionsForBuilding(building.getBuildingId())) {
                    resourceIncomes.put(prod.getResource().getName(), resourceIncomes.get(prod.getResource().getName()) + prod.getProduction());
                }
                for (BuildingUpkeep upkeep : StaticDataCache.getUpkeepsForBuilding(building.getBuildingId())) {
                    resourceIncomes.put(upkeep.getResource().getName(), resourceIncomes.get(upkeep.getResource().getName()) - upkeep.getUpkeep());
                }
            }
        }

        for (Army army : armies){
            List <UnitUpkeep> unitUpkeeps = StaticDataCache.getUnitUpkeepOf(army.getArmyType().getUnitId());
            for (UnitUpkeep unitUpkeep : unitUpkeeps) {
                resourceIncomes.put(unitUpkeep.getResource().getName(), resourceIncomes.get(unitUpkeep.getResource().getName()) - unitUpkeep.getUpkeep()*army.getSize());
            }
        }

        for (int i = 0; i < resources.size(); i++) {
            if (resourceIncomes.get(resources.get(i).getName()) >= 0) {
                incomeLabels.get(i).setText("+" + resourceIncomes.get(resources.get(i).getName()));
            } else {
                incomeLabels.get(i).setText("" + resourceIncomes.get(resources.get(i).getName()));
            }
        }

        System.out.println(resourceIncomes);
    }

    public void updateTurn(int turn) {
        turnLabel.setText("Tura " + turn);
        updateResources();
    }

    public Button getMenuButton() {
        return menuButton;
    }

    public Button getArmyButton() {
        return armyButton;
    }

    public void setScoreboardMenu(ScoreboardMenu menu) {
        this.scoreboardMenu = menu;
        scoreboardButton.setOnAction(event -> {
            if (scoreboardMenu != null) {
                sessionData.updateScores();
                scoreboardMenu.updateScoreboard();
                scoreboardMenu.setVisible(true);
            }
        });
    }

    public Button getScoreboardButton() {
        return scoreboardButton;
    }

    public void setHelpMenu(HelpMenu menu) {
        this.helpMenu = menu;
        helpButton.setOnAction(event -> {
            if (helpMenu != null) {
                if (!helpMenu.isVisible()) {
                    helpMenu.show();
                } else {
                    helpMenu.close();
                }
            }
        });
    }
}
