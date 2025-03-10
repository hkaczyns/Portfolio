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

import java.util.List;
import java.util.Objects;

public class TerritoryMenu extends VBox {
    private Runnable onBuildingBuiltCallback;

    public TerritoryMenu() {
        super();

        setStyle("-fx-background-color: rgba(39, 26, 12, 0.8);");
        setPadding(new Insets(20));
        StackPane.setMargin(this, new Insets(0, 0, 0, 350));
        setVisible(false);
        setTranslateY(50);
    }

    public void openMenu(Territory territory, GameSessionData sessionData) {
        getChildren().clear();

        // Territory name
        Label nameLabel = new Label(territory.getName().toUpperCase());
        nameLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 36));
        nameLabel.setStyle("-fx-text-fill: white;");
        nameLabel.setWrapText(true);
        nameLabel.setMouseTransparent(true);
        nameLabel.setMaxWidth(Double.MAX_VALUE);
        nameLabel.setAlignment(Pos.CENTER);
        nameLabel.setTranslateY(-30);

        // Territory description
        Label descriptionLabel = new Label(territory.getDescription());
        descriptionLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 18));
        descriptionLabel.setStyle("-fx-text-fill: white;");
        descriptionLabel.setWrapText(true);
        descriptionLabel.setMaxWidth(Double.MAX_VALUE);
        descriptionLabel.setAlignment(Pos.CENTER);
        descriptionLabel.setTranslateY(-30);

        // Close button
        Button closeButton = getCloseButton();

        getChildren().addAll(closeButton, nameLabel, descriptionLabel);


        // BUILDINGS

        Label buildingsLabel = new Label("BUDYNKI");
        buildingsLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 24));
        buildingsLabel.setStyle("-fx-text-fill: white; -fx-alignment: center;");
        buildingsLabel.setWrapText(true);
        buildingsLabel.setMouseTransparent(true);
        buildingsLabel.setMaxWidth(Double.MAX_VALUE);
        buildingsLabel.setAlignment(Pos.CENTER);
        getChildren().add(buildingsLabel);


        FlowPane buildingsList = new FlowPane();
        buildingsList.setHgap(20);
        buildingsList.setVgap(5);
        buildingsList.setPrefWrapLength(950);
        buildingsList.setMaxWidth(950);


        List<BuildingInfo> allBuildings = StaticDataCache.getBuildingInfos();
        List<Construction> constructionsInTerritory = sessionData.getConstructionsForTerritory(territory);

        for (BuildingInfo building : allBuildings) {

            // Check if this building exists in the current territory
            boolean isConstructed = constructionsInTerritory.stream()
                    .anyMatch(construction -> construction.getBuilding().getBuildingId().equals(building.getBuildingId()));

            boolean canAfford = canAffordBuilding(building, sessionData);


            String imagePath = building.getBuildingImg() != null
                    ? "/img/buildings/" + building.getBuildingImg()
                    : "/img/buildings/default.png";
            Image buildingImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream(imagePath)), 70, 70, true, true);
            ImageView buildingImageView = new ImageView(buildingImage);
            if (!isConstructed) {
                buildingImageView.setStyle("-fx-opacity: 0.3;");
            }

            // Building details
            VBox buildingDetails = new VBox();
            buildingDetails.setSpacing(5);
            buildingDetails.setPrefWidth(180);
            buildingDetails.setMaxWidth(180);

            Text buildingName = new Text(building.getName());
            buildingName.setStyle("-fx-fill: white; -fx-font-size: 16; -fx-font-family: 'Pirata One';");

            Font almendraFont = Font.loadFont(getClass().getResourceAsStream("/fonts/Almendra-Regular.ttf"), 12);

            Text buildingDescription = new Text(building.getDescription());
            buildingDescription.setStyle("-fx-fill: white; -fx-font-size: 12; -fx-font-family: 'Almendra';");

            List<BuildingCost> buildingCosts = StaticDataCache.getBuildingCostsOfBuilding(building.getBuildingId());
            int upkeep = StaticDataCache.getUpkeepsForBuilding(building.getBuildingId()).get(0).getUpkeep();
            int prod = StaticDataCache.getProductionsForBuilding(building.getBuildingId()).get(0).getProduction();
            String prodResource = StaticDataCache.getProductionsForBuilding(building.getBuildingId()).get(0).getResource().getName();
            String upkeepResource = StaticDataCache.getUpkeepsForBuilding(building.getBuildingId()).get(0).getResource().getName();
            StringBuilder costString = new StringBuilder("Koszt: DARMO!");
            if (!buildingCosts.isEmpty()) {
                costString = new StringBuilder("Koszt: ");
                for (BuildingCost buildingCost : buildingCosts) {
                    String resourceName = buildingCost.getResource().getName();
                    Integer cost = buildingCost.getCost();
                    costString.append(resourceName).append(" ").append(cost).append(" ");
                }
            }
            costString.append("\nCo tura: +").append(prod).append(" ").append(prodResource).append(" -").append(upkeep).append(" ").append(upkeepResource);
            Text buildingCost = new Text(costString.toString());
            buildingCost.setStyle("-fx-fill: white; -fx-font-size: 12; -fx-font-family: 'Almendra';");

            Button buildButton = new Button("BUDUJ");
            buildButton.setStyle("-fx-background-color: " + (isConstructed ? "gray" : "transparent") + "; " +
                    "-fx-text-fill: " + ((!isConstructed && !canAfford) ? "gray" : "white") + "; " +
                    "-fx-font-size: 12; " +
                    "-fx-border-color: " + ((isConstructed || !canAfford) ? "gray" : "white") + "; " +
                    "fx-padding: 2; " +
                    "-fx-font-family: 'Pirata One';");
            HBox buildButtonContainer = new HBox(buildButton);
            buildButtonContainer.setAlignment(Pos.CENTER);

            if (!isConstructed && canAfford) {
                buildButton.setOnAction(event -> buildBuilding(building, territory, sessionData, sessionData.getCurrentPlayer(), false));
            } else {
                buildButton.setDisable(true);
                if (isConstructed) {
                    buildButton.setText("ZBUDOWANO");
                } else {
                    buildButton.setText("BRAK SUROWCÓW");
                }
            }

            buildingDetails.getChildren().addAll(buildingName, buildingDescription, buildingCost, buildButtonContainer);

            // Building cell
            HBox buildingCell = new HBox();
            buildingCell.setSpacing(5);
            buildingCell.setStyle("-fx-padding: 10; -fx-border-color: rgb(77, 51, 25); -fx-border-width: 1; -fx-background-color: rgba(39, 26, 12, 0.9);");
            buildingCell.setAlignment(Pos.CENTER_LEFT);
            buildingCell.setPrefWidth(270);
            buildingCell.setMaxWidth(270);

            buildingCell.getChildren().addAll(buildingImageView, buildingDetails);
            HBox.setHgrow(buildingDetails, Priority.ALWAYS);

            buildingsList.getChildren().add(buildingCell);
        }

        getChildren().add(buildingsList);

        setVisible(true);
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

    private void closeMenu() {
        setVisible(false);
    }


    public void buildBuilding(BuildingInfo building, Territory territory, GameSessionData sessionData, Player player, boolean isTest) {

        Construction construction = new Construction();
        construction.setBuilding(building);
        construction.setTerritory(territory);
        construction.setSession(sessionData.getCurrentSession());

        sessionData.addConstruction(construction);

        List<PlayerResource> playerResources = sessionData.getAllResourcesOf(player.getPlayerId());
        List<BuildingCost> buildingCosts = StaticDataCache.getBuildingCostsOfBuilding(building.getBuildingId());

        for (BuildingCost buildingCost : buildingCosts) {
            String resourceName = buildingCost.getResource().getName();
            Integer cost = buildingCost.getCost();
            PlayerResource playerResource = playerResources.stream()
                    .filter(pr -> pr.getResource().getName().equals(resourceName))
                    .findFirst()
                    .orElseThrow();
            playerResource.setQuantity(playerResource.getQuantity() - cost);
        }

        System.out.println("Built " + building.getName() + " in " + territory.getName() + "!");

        if (onBuildingBuiltCallback != null) {
            onBuildingBuiltCallback.run();
        }

        if (!isTest) {
            openMenu(territory, sessionData);
        }
    }

    private boolean canAffordBuilding(BuildingInfo building, GameSessionData sessionData) {
        List<BuildingCost> buildingCosts = StaticDataCache.getBuildingCostsOfBuilding(building.getBuildingId());

        for (BuildingCost buildingCost : buildingCosts) {
            String resourceName = buildingCost.getResource().getName();
            Integer cost = buildingCost.getCost();
            Integer playerResourceQuantity = sessionData.getCurrentPlayerResourceQuantity(resourceName);

            if (playerResourceQuantity < cost) {
                return false;
            }
        }

        return true;
    }

    public void setOnBuildingBuiltCallback(Runnable callback) {
        this.onBuildingBuiltCallback = callback;
    }


}
