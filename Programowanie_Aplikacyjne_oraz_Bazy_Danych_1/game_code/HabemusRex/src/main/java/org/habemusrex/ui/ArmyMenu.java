package org.habemusrex.ui;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.Text;
import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.entities.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Random;


public class ArmyMenu extends VBox {
    private Runnable onArmyChangeCallback;
    private Runnable onTurnConsumptionCallback;

    public ArmyMenu() {
        super();
        setStyle("-fx-background-color: rgba(39, 26, 12, 0.8);");
        setPadding(new Insets(20));
        StackPane.setMargin(this, new Insets(0, 0, 0, 350));
        setVisible(false);
        setTranslateY(50);
        setMaxWidth(950);
    }
    public void openMenu(GameSessionData gameSessionData) {
        getChildren().clear();

        // Window Name
        Label nameLabel = new Label("REKRUTUJ");
        nameLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 36));
        nameLabel.setStyle("-fx-text-fill: white;");
        nameLabel.setWrapText(true);
        nameLabel.setMouseTransparent(true);
        nameLabel.setMaxWidth(Double.MAX_VALUE);
        nameLabel.setAlignment(Pos.CENTER);
        nameLabel.setTranslateY(-30);

        // Close button
        Button closeButton = getCloseButton();

        getChildren().addAll(closeButton, nameLabel);

        FlowPane unitList = new FlowPane();
        unitList.setHgap(5);
        unitList.setVgap(5);
        unitList.setPrefWrapLength(950);
        unitList.setMaxWidth(950);

        List<UnitType> allUnits = StaticDataCache.getUnitTypes();

        for (UnitType unit : allUnits) {
            String imagePath = unit.getImage() != null
                    ? "/img/units/" + unit.getImage()
                    : "/img/units/default.jpg";
            Image unitImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream(imagePath)), 100, 100, true, true);
            ImageView unitImageView = new ImageView(unitImage);

            VBox unitDetails = new VBox();
            unitDetails.setSpacing(5);
            unitDetails.setPrefWidth(180);
            unitDetails.setMaxWidth(180);

            Text unitName = new Text(unit.getName());
            unitName.setStyle("-fx-fill: white; -fx-font-size: 16; -fx-font-family: 'Pirata One';");

            Font almendraFont = Font.loadFont(getClass().getResourceAsStream("/fonts/Almendra-Regular.ttf"), 12);

            StringBuilder unitCount = new StringBuilder("Posiadasz: ");
            Integer count = gameSessionData.getUnitCountFor(gameSessionData.getCurrentPlayer(), unit.getUnitId());
            unitCount.append(count);
            Text unitNumber = new Text(unitCount.toString());
            unitNumber.setStyle("-fx-fill: white; -fx-font-size: 12; -fx-font-family: 'Almendra';");

            Text unitDescription = new Text(unit.getDescription());
            unitDescription.setStyle("-fx-fill: white; -fx-font-size: 14; -fx-font-family: 'Almendra';");



            List<UnitCost> unitCosts = StaticDataCache.getUnitCostsOf(unit.getUnitId());
            StringBuilder costString = new StringBuilder("Koszt: DARMO!");
            if (!unitCosts.isEmpty()) {
                costString = new StringBuilder("Koszt: ");
                for (UnitCost unitCost : unitCosts) {
                    String resourceName = unitCost.getResource().getName();
                    Integer cost = unitCost.getCost();
                    costString.append(resourceName).append(" ").append(cost).append(" ");
                }
            }
            Text unitCost = new Text(costString.toString());
            unitCost.setStyle("-fx-fill: white; -fx-font-size: 12; -fx-font-family: 'Almendra';");

            List<UnitUpkeep> unitUpkeeps = StaticDataCache.getUnitUpkeepOf(unit.getUnitId());
            StringBuilder upkeepString = new StringBuilder("Utrzymanie: DARMO!");
            if (!unitUpkeeps.isEmpty()) {
                upkeepString = new StringBuilder("Utrzymanie: ");
                for (UnitUpkeep unitUpkeep : unitUpkeeps) {
                    String resourceName = unitUpkeep.getResource().getName();
                    Integer upkeep = unitUpkeep.getUpkeep();
                    upkeepString.append(resourceName).append(" ").append(upkeep).append(" ");
                }
            }
            Text unitUpkeep = new Text(upkeepString.toString());
            unitUpkeep.setStyle("-fx-fill: white; -fx-font-size: 12; -fx-font-family: 'Almendra';");

            Text unitOffensive = new Text("Atak: " + unit.getOffensiveStrength());
            unitOffensive.setStyle("-fx-fill: white; -fx-font-size: 12; -fx-font-family: 'Almendra';");

            Text unitDefensive = new Text("Obrona: " + unit.getDefensiveStrength());
            unitDefensive.setStyle("-fx-fill: white; -fx-font-size: 12; -fx-font-family: 'Almendra';");

            HBox unitBlock = new HBox();

            unitDetails.getChildren().addAll(unitName, unitDescription, unitNumber, unitCost, unitUpkeep, unitOffensive, unitDefensive);

            unitBlock.getChildren().addAll(unitImageView, unitDetails);
            boolean canRecruit = true;
            for (UnitCost cost: unitCosts) {
                if (gameSessionData.getCurrentPlayerResourceQuantity(cost.getResource().getName()) < cost.getCost()) {
                    canRecruit = false;
                }
            }
            Button recruitButton = new Button("REKRUTUJ");
            recruitButton.setStyle("-fx-background-color: transparent; " +
                    "-fx-text-fill: white; " +
                    "-fx-font-size: 16; " +
                    "-fx-border-color: transparent; " +
                    "-fx-font-family: 'Pirata One';");
            if(! canRecruit) {
                recruitButton.setText("BRAK SUROWCÓW");
                recruitButton.setDisable(true);
            }
            recruitButton.setOnAction(event -> recruit(unit, gameSessionData, gameSessionData.getCurrentPlayer(), true));

            boolean canDismiss = false;
            List<Army> playerArmy = new ArrayList<>();
            playerArmy = gameSessionData.getArmyOfPlayer(gameSessionData.getCurrentPlayer().getPlayerId());
            for (Army army: playerArmy) {
                if (army.getArmyType().getUnitId().equals(unit.getUnitId())) {
                    canDismiss = true;
                    break;
                }
            }
            Button dismissButton = new Button("ZWOLNIJ");
            dismissButton.setStyle("-fx-background-color: transparent; " +
                    "-fx-text-fill: white; " +
                    "-fx-font-size: 16; " +
                    "-fx-border-color: transparent; " +
                    "-fx-font-family: 'Pirata One';");
            if(! canDismiss) {
                dismissButton.setText("NIE POSIADASZ");
                dismissButton.setDisable(true);
            }
            dismissButton.setOnAction(event -> dismiss(unit, gameSessionData, gameSessionData.getCurrentPlayer().getPlayerId(), true));

            HBox buttonContainer = new HBox(recruitButton, dismissButton);
            buttonContainer.setAlignment(Pos.CENTER);

            VBox bigContainer = new VBox();
            bigContainer.setSpacing(5);
            bigContainer.setStyle("-fx-padding: 10; -fx-border-color: rgb(77, 51, 25); -fx-border-width: 1; -fx-background-color: rgba(39, 26, 12, 0.9);");
            bigContainer.setAlignment(Pos.CENTER_LEFT);
            bigContainer.setPrefWidth(270);
            bigContainer.setMaxWidth(270);
            bigContainer.getChildren().addAll(unitBlock, buttonContainer);

            unitList.getChildren().add(bigContainer);
        }
        getChildren().add(unitList);
        makeVisible(gameSessionData);
    }

    public void makeVisible(GameSessionData sessionData) {
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

    public void recruit(UnitType unitType, GameSessionData sessionData, Player player, boolean show)
    {
        boolean newGroup = true;
        List<Army> playerArmy = new ArrayList<>();
        playerArmy = sessionData.getArmyOfPlayer(player.getPlayerId());
        for (Army army: playerArmy) {
            if (army.getArmyType().getUnitId().equals(unitType.getUnitId())) {
                newGroup = false;
                break;
            }
        }
        if (newGroup) {
            Army newArmy = new Army();
            newArmy.setSession(sessionData.getCurrentSession());
            newArmy.setSize(1);
            newArmy.setPlayer(player);
            newArmy.setArmyType(unitType);
            newArmy.setSession(sessionData.getCurrentSession());
            sessionData.addArmy(newArmy);
        }
        else
        {
            for (Army army: playerArmy) {
                if (army.getArmyType().getUnitId().equals(unitType.getUnitId())) {
                    int size = army.getSize();
                    army.setSize(size+1);
                }
            }
        }
        List<PlayerResource> playerResources = sessionData.getAllResourcesOf(player.getPlayerId());
        List<UnitCost> unitCosts = StaticDataCache.getUnitCostsOf(unitType.getUnitId());
        for (UnitCost unitCost : unitCosts) {
            String resourceName = unitCost.getResource().getName();
            Integer cost = unitCost.getCost();
            PlayerResource playerResource = playerResources.stream()
                    .filter(pr -> pr.getResource().getName().equals(resourceName))
                    .findFirst()
                    .orElseThrow();
            playerResource.setQuantity(playerResource.getQuantity() - cost);
        }

        System.out.println("Recruited " + unitType.getName() + "!");

        if (onArmyChangeCallback != null) {
            onArmyChangeCallback.run();
        }
        if (show) {
            openMenu(sessionData);
        }
    }
    public void dismiss(UnitType unitType, GameSessionData sessionData, int player, boolean show)
    {
        List<Army> playerArmy = new ArrayList<>();
        playerArmy = sessionData.getArmyOfPlayer(player);
        for (Army army: playerArmy) {
            if (army.getArmyType().getUnitId().equals(unitType.getUnitId())) {
                int size = army.getSize();
                size = size - 1;
                army.setSize(size);
                if (size == 0)
                {
                    sessionData.deleteArmyEntry(army);
                }
            }
        }
        if (show){
            openMenu(sessionData);
        }
        if (onArmyChangeCallback != null) {
            onArmyChangeCallback.run();
        }
    }

    public int armyResourceConsume(GameSessionData sessionData, Player player) {
        int unitsKilled = 0;
        List<Army> playerArmy = new ArrayList<>();
        playerArmy = sessionData.getArmyOfPlayer(player.getPlayerId());
        List<PlayerResource> playerResources = sessionData.getAllResourcesOf(player.getPlayerId());
        for (Army army: playerArmy) {
            List<UnitUpkeep> unitUpkeeps = StaticDataCache.getUnitUpkeepOf(army.getArmyType().getUnitId());
            for (UnitUpkeep unitUpkeep : unitUpkeeps) {
                String resourceName = unitUpkeep.getResource().getName();
                Integer cost = unitUpkeep.getUpkeep();
                cost = cost * army.getSize();
                PlayerResource playerResource = playerResources.stream()
                        .filter(pr -> pr.getResource().getName().equals(resourceName))
                        .findFirst()
                        .orElseThrow();
                playerResource.setQuantity(playerResource.getQuantity() - cost);
            }
        }
        Random random = new Random();
        for(PlayerResource resource: playerResources) {
            while(resource.getQuantity() < 0 && sessionData.getTotalUnitsOf(player.getPlayerId()) > 0) {
                playerArmy = sessionData.getArmyOfPlayer(player.getPlayerId());
                int choice;
                if (playerArmy.size() > 1) {
                    choice = random.nextInt(playerArmy.size());
                }
                else {
                    choice = 0;
                }
                Army army = playerArmy.get(choice);
                List<UnitUpkeep> upkeeps = StaticDataCache.getUnitUpkeepOf(army.getArmyType().getUnitId());
                for (UnitUpkeep upkeep : upkeeps) {
                    String resourceName = upkeep.getResource().getName();
                    PlayerResource returned = playerResources.stream()
                            .filter(pr -> pr.getResource().getName().equals(resourceName))
                            .findFirst()
                            .orElseThrow();
                    returned.setQuantity(returned.getQuantity() + upkeep.getUpkeep());
                }
                dismiss(army.getArmyType(), sessionData, player.getPlayerId(), false);
                unitsKilled = unitsKilled + 1;
            }
        }
        if (onTurnConsumptionCallback != null) {
            onTurnConsumptionCallback.run();
        }
        return unitsKilled;
    }
    public void setOnArmyChangeCallback(Runnable callback) {
        this.onArmyChangeCallback = callback;
    }
    public void setOnTurnConsumptionCallback(Runnable callback) {
        this.onTurnConsumptionCallback = callback;
    }
}



