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
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.entities.BuildingInfo;
import org.habemusrex.entities.Construction;
import org.habemusrex.entities.Territory;
import org.habemusrex.entities.TerritoryOwnership;

import java.util.List;
import java.util.Objects;

public class TerritoryPanel extends VBox {

    private MediaPlayer territoryNoisePlayer;
    private Runnable onCloseCallback;
    private Runnable onBuildingBuiltCallback;
    private Runnable onBattleEndedCallback;

    private TerritoryMenu territoryMenu;
    private BattleMenu battleMenu;

    public TerritoryPanel() {
        super(10);

        setPadding(new Insets(10));
        setStyle("-fx-background-color: linear-gradient(to bottom, rgba(77, 51, 25, 0.8), rgba(130, 84, 38, 0.8)); " +
                "-fx-border-color: rgb(179, 134, 0); " +
                "-fx-border-width: 2; -fx-border-style: hidden solid hidden hidden;");
        setMaxWidth(350);
        setTranslateX(0);
        setTranslateY(50);
        setVisible(false);
    }

    public void showTerritoryDetails(Territory territory, GameSessionData sessionData) {
        getChildren().clear();
        List<Construction> constructions = sessionData.getConstructionsForTerritory(territory);


        // Territory name
        Label nameLabel = new Label(territory.getName().toUpperCase());
        nameLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 36));
        nameLabel.setStyle("-fx-text-fill: white; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        nameLabel.setWrapText(true);
        nameLabel.setMaxWidth(350);
        nameLabel.setMouseTransparent(true);
        nameLabel.setAlignment(Pos.CENTER);
        nameLabel.setTranslateY(-30);

        // Territory description
        Label descriptionLabel = new Label(territory.getDescription());
        descriptionLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 18));
        descriptionLabel.setStyle("-fx-text-fill: white;");
        descriptionLabel.setWrapText(true);
        descriptionLabel.setMaxWidth(350);
        descriptionLabel.setAlignment(Pos.CENTER);
        descriptionLabel.setTranslateY(-40);

        // Territory image
        String pathToImage = territory.getPanelImg() != null
                ? "/img/territories/" + territory.getPanelImg()
                : "/img/territories/error.png";
        Image territoryImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream(pathToImage)));
        ImageView territoryImageView = new ImageView(territoryImage);
        territoryImageView.setFitWidth(300);
        territoryImageView.setPreserveRatio(true);
        territoryImageView.setStyle("-fx-border-color: black; -fx-border-width: 3; " +
                "-fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        territoryImageView.setTranslateY(-40);


        StackPane imageContainer = new StackPane(territoryImageView);
        imageContainer.setAlignment(Pos.CENTER);

        // Close button
        Button closeButton = getCloseButton();

        // Close button container
        StackPane closeButtonContainer = new StackPane(closeButton);
        StackPane.setMargin(closeButton, new Insets(5, 5, 5, 5));
        closeButtonContainer.setStyle("-fx-alignment: top-right;");
        closeButtonContainer.setAlignment(Pos.TOP_RIGHT);

        getChildren().addAll(closeButtonContainer, nameLabel, descriptionLabel, imageContainer);

        // Play sound of the territory
        playTerritoryNoise(territory);

        // BUILDINGS
        Label buildingsHeader = new Label("BUDOWLE");

        buildingsHeader.setStyle("-fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);" +
                "-fx-text-fill: white; -fx-font-size: 24; -fx-alignment: center; -fx-font-family: 'Pirata One';");
        buildingsHeader.setPrefWidth(350);
        buildingsHeader.setAlignment(Pos.CENTER);

        getChildren().add(buildingsHeader);

        buildingsPreview(constructions);

        Region spacer = new Region();
        VBox.setVgrow(spacer, Priority.ALWAYS);

        getChildren().add(spacer);

        // Check if the playerId of the territory's owner is 1
        TerritoryOwnership ownership = sessionData.getOwnership(territory.getTerritoryId());

        if (ownership != null && ownership.getPlayer().getFraction().getFractionId() == 1) {
            Button territoryMenuButton = new Button("Przejdź do miasta");
            territoryMenuButton.setStyle("-fx-background-color: rgb(39, 26, 12); -fx-text-fill: white; " +
                    "-fx-font-size: 16; -fx-font-family: 'Pirata One'; -fx-position: absolute;");
            territoryMenuButton.setAlignment(Pos.CENTER);
            territoryMenuButton.setOnAction(event -> openTerritoryMenu(territory, sessionData));

            StackPane territoryMenuButtonContainer = new StackPane(territoryMenuButton);
            territoryMenuButtonContainer.setStyle("-fx-position: absolute;");
            territoryMenuButtonContainer.setAlignment(Pos.CENTER);
            territoryMenuButtonContainer.setTranslateY(-60);

            getChildren().add(territoryMenuButtonContainer);
        }
        else {
            Button territoryMenuButton = new Button("Podbij");
            territoryMenuButton.setStyle("-fx-background-color: rgb(39, 26, 12); -fx-text-fill: white; " +
                    "-fx-font-size: 16; -fx-font-family: 'Pirata One'; -fx-position: absolute;");
            territoryMenuButton.setAlignment(Pos.CENTER);
            territoryMenuButton.setOnAction(event -> openBattleMenu(sessionData, Objects.requireNonNull(ownership).getPlayer().getFraction().getFractionId(), territory));

            StackPane territoryMenuButtonContainer = new StackPane(territoryMenuButton);
            territoryMenuButtonContainer.setStyle("-fx-position: absolute;");
            territoryMenuButtonContainer.setAlignment(Pos.CENTER);
            territoryMenuButtonContainer.setTranslateY(-60);

            getChildren().add(territoryMenuButtonContainer);
        }
        setVisible(true);
    }

    private void buildingsPreview(List<Construction> constructions) {
        if (!constructions.isEmpty()) {

            FlowPane buildingsContainer = new FlowPane();
            buildingsContainer.setHgap(10);
            buildingsContainer.setVgap(10);
            buildingsContainer.setPrefWrapLength(300);
            buildingsContainer.setMaxHeight(300);
            buildingsContainer.setAlignment(Pos.CENTER);

            StackPane hoverParent = new StackPane();
            hoverParent.setMouseTransparent(true);
            hoverParent.setStyle("-fx-background-color: transparent; -fx-position: absolute;");

            for (Construction construction : constructions) {
                BuildingInfo building = construction.getBuilding();
                String buildingImgPath = building.getBuildingImg() != null
                        ? "/img/buildings/" + building.getBuildingImg()
                        : "/img/buildings/error.png";

                Image buildingImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream(buildingImgPath)));
                ImageView buildingImageView = new ImageView(buildingImage);
                buildingImageView.setFitWidth(50);
                buildingImageView.setFitHeight(50);
                buildingImageView.setPreserveRatio(true);

                StackPane borderedIcon = new StackPane(buildingImageView);
                borderedIcon.setStyle("-fx-border-color: rgb(77, 51, 25); -fx-border-width: 3; -fx-border-radius: 5;");

                // Hover box
                VBox hoverBox = new VBox();
                hoverBox.setStyle("-fx-background-color: rgba(42, 7, 7, 0.8); " +
                        "-fx-padding: 10; " +
                        "-fx-border-color: rgb(179, 134, 0); " +
                        "-fx-border-width: 3;");
                hoverBox.setPrefWidth(200);
                hoverBox.setMaxWidth(200);
                hoverBox.setAlignment(Pos.TOP_LEFT);

                Label hoverName = new Label(building.getName().toUpperCase());
                hoverName.setStyle("-fx-text-fill: white; -fx-font-size: 16; " +
                        "-fx-alignment: center; -fx-font-family: 'Pirata One';" +
                        "-fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
                hoverName.setPrefWidth(200);
                hoverName.setWrapText(true);

                Label hoverDescription = new Label(building.getDescription());
                hoverDescription.setStyle("-fx-text-fill: white; -fx-font-size: 12; -fx-font-family: 'Pirata One';" +
                        "-fx-alignment: center;");
                hoverDescription.setPrefWidth(200);
                hoverDescription.setWrapText(true);

                int upkeep = StaticDataCache.getUpkeepsForBuilding(building.getBuildingId()).get(0).getUpkeep();
                int prod = StaticDataCache.getProductionsForBuilding(building.getBuildingId()).get(0).getProduction();
                String prodResource = StaticDataCache.getProductionsForBuilding(building.getBuildingId()).get(0).getResource().getName();
                String upkeepResource = StaticDataCache.getUpkeepsForBuilding(building.getBuildingId()).get(0).getResource().getName();
                String perTurnInfo = "Produkcja: +" + prod + " " + prodResource + "\nUtrzymanie: -" + upkeep + " " + upkeepResource;
                Label hoverProduction = new Label(perTurnInfo);
                hoverProduction.setStyle("-fx-text-fill: white; -fx-font-size: 12; -fx-font-family: 'Pirata One';");
                hoverProduction.setWrapText(true);

                hoverBox.getChildren().addAll(hoverName, hoverDescription, hoverProduction);
                hoverBox.setVisible(false);

                hoverParent.getChildren().add(hoverBox);

                borderedIcon.setOnMouseEntered(event -> {
                    // Hide all other hover boxes
                    hoverParent.getChildren().forEach(node -> node.setVisible(false));

                    hoverBox.setVisible(true);

                    hoverBox.setTranslateX(event.getSceneX() - hoverBox.getPrefWidth() / 2);
                    hoverBox.setTranslateY(event.getY() - hoverBox.getHeight());


                });

                borderedIcon.setOnMouseMoved(event -> {
                    hoverBox.setTranslateX(event.getSceneX() - hoverBox.getPrefWidth() / 2);
                    hoverBox.setTranslateY(event.getY() - hoverBox.getHeight());
                });

                borderedIcon.setOnMouseExited(event -> hoverBox.setVisible(false));

                buildingsContainer.getChildren().add(borderedIcon);
            }

            getChildren().addAll(buildingsContainer, hoverParent);
        }
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
        closeButton.setOnAction(event -> closePanel());
        return closeButton;
    }

    public void setOnCloseCallback(Runnable onCloseCallback) {
        this.onCloseCallback = onCloseCallback;
    }

    private void closePanel() {
        setVisible(false);
        if (territoryNoisePlayer != null) {
            territoryNoisePlayer.stop();
            territoryNoisePlayer = null;
            if (territoryMenu != null) {
                territoryMenu.setVisible(false);
            }
            if (battleMenu != null) {
                battleMenu.setVisible(false);
            }

        }
        if (onCloseCallback != null) {
            onCloseCallback.run();
        }
    }

    private void playTerritoryNoise(Territory territory) {
        if (territoryNoisePlayer != null) {
            territoryNoisePlayer.stop();
        }
        String noiseFilePath = switch (territory.getTerritoryType()) {
            case city -> "/audio/territories/city_sound.wav";
            case countryside -> "/audio/territories/countryside_sound.wav";
            default -> null;
        };

        if (noiseFilePath != null) {
            Media territoryNoise = new Media(Objects.requireNonNull(getClass().getResource(noiseFilePath)).toString());
            territoryNoisePlayer = new MediaPlayer(territoryNoise);
            territoryNoisePlayer.setVolume(0.1);
            territoryNoisePlayer.setCycleCount(MediaPlayer.INDEFINITE);
            territoryNoisePlayer.play();
        }
    }

    private void openTerritoryMenu(Territory territory, GameSessionData sessionData) {
        if (territoryMenu == null) {
            territoryMenu = new TerritoryMenu();
            ((StackPane) getParent()).getChildren().add(territoryMenu);
        }

        territoryMenu.setOnBuildingBuiltCallback(() -> {
            if (onBuildingBuiltCallback  != null) {
                showTerritoryDetails(territory, sessionData);
                onBuildingBuiltCallback .run();
            }
        });

        territoryMenu.openMenu(territory, sessionData);
    }

    private void openBattleMenu(GameSessionData sessionData, int enemy, Territory territory) {
        if (battleMenu == null) {
            battleMenu = new BattleMenu(sessionData);
            ((StackPane) getParent()).getChildren().add(battleMenu);
        }
        battleMenu.setOnBattleEndCallback(()->{
            if(onBattleEndedCallback != null) {
                showTerritoryDetails(territory, sessionData);
                onBattleEndedCallback .run();
            }
        });
        battleMenu.openMenu(sessionData, enemy, territory);
    }

    public void setOnBuildingBuiltCallback(Runnable callback) {
        this.onBuildingBuiltCallback = callback;
    }
    public void setOnBattleEndedCallback(Runnable callback) {
        this.onBattleEndedCallback = callback;
    }
}
