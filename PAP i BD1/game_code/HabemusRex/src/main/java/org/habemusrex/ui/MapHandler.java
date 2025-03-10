package org.habemusrex.ui;

import javafx.animation.TranslateTransition;
import javafx.geometry.Bounds;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.control.ScrollPane;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.ScrollEvent;
import javafx.scene.layout.Pane;
import javafx.scene.paint.Color;
import javafx.scene.paint.ImagePattern;
import javafx.scene.shape.Circle;
import javafx.scene.transform.Scale;
import org.habemusrex.entities.Territory;

import java.util.List;
import java.util.Objects;

public class MapHandler {

    private final Group mapGroup;
    private final Pane mapPane;
    private final ScrollPane scrollPane;
    private final Scale scale;

    private Circle currentSelectedTerritory = null;
    private final MapHandlerCallback callback;


    private final Image mapImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/map.jpg")));

    private final ImageView cloudView;

    public interface MapHandlerCallback {
        void onTerritorySelected(Territory territory);
    }

    public MapHandler(MapHandlerCallback callback) {
        this.callback = callback;

        // Map view
        ImageView mapView = new ImageView(mapImage);
        mapView.setPreserveRatio(true);

        // mapGroup = map + clouds
        mapGroup = new Group(mapView);

        // Pane for map
        mapPane = new Pane(mapGroup);
        mapPane.setPrefSize(mapImage.getWidth(), mapImage.getHeight());

        // Scroll pane (panning)
        scrollPane = new ScrollPane(mapPane);
        scrollPane.setPannable(true);
        scrollPane.setHvalue(0.5);
        scrollPane.setVvalue(0.5);
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);

        // Cloud overlay
        Image cloudImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream("/img/clouds.png")));
        cloudView = new ImageView(cloudImage);
        cloudView.setOpacity(0.5);
        cloudView.setFitWidth(mapImage.getWidth());
        cloudView.setPreserveRatio(true);
        cloudView.setMouseTransparent(true);
        mapGroup.getChildren().add(cloudView);

        animateClouds();

        // Scale for zooming
        scale = new Scale(1, 1, 500, 500);
        mapGroup.getTransforms().add(scale);

        // Zooming
        mapPane.setOnScroll(this::handleZoom);
    }

    private void handleZoom(ScrollEvent event) {
        double newScaleX = getNewScaleX(event);

        scale.setX(newScaleX);
        scale.setY(newScaleX);

        // Calculate the center of the visible area
        double viewportCenterX = (scrollPane.getHvalue() * (mapImage.getWidth() - scrollPane.getViewportBounds().getWidth())) + scrollPane.getViewportBounds().getWidth() / 2.0;
        double viewportCenterY = (scrollPane.getVvalue() * (mapImage.getHeight() - scrollPane.getViewportBounds().getHeight())) + scrollPane.getViewportBounds().getHeight() / 2.0;

        // Set the pivot for zooming
        scale.setPivotX(viewportCenterX);
        scale.setPivotY(viewportCenterY);

        System.out.println("Cursor: " + event.getX() + " " + event.getY());

        event.consume();
    }

    private double getNewScaleX(ScrollEvent event) {
        double zoomFactor = 1.02;
        if (event.getDeltaY() < 0) {
            zoomFactor = 2.0 - zoomFactor;
        }
        double newScaleX = scale.getX() * zoomFactor;
        double newScaleY = scale.getY() * zoomFactor;

        Bounds bounds = mapGroup.getBoundsInParent();
        double minX = bounds.getMinX();
        double minY = bounds.getMinY();
        double maxX = bounds.getMaxX();
        double maxY = bounds.getMaxY();
        if (minX * newScaleX > 0) {
            newScaleX = 0 / minX;
        }
        if (minY * newScaleY > 0) {
            newScaleX = 0 / minY;
        }
        if (maxX * newScaleX < mapPane.getWidth()) {
            newScaleX = mapPane.getWidth() / maxX;
        }
        if (maxY * newScaleY < mapPane.getHeight()) {
            newScaleX = mapPane.getHeight() / maxY;
        }
        return newScaleX;
    }

    private void animateClouds() {
        TranslateTransition cloudAnimation = new TranslateTransition();
        cloudAnimation.setNode(cloudView);
        cloudAnimation.setDuration(javafx.util.Duration.seconds(40));
        cloudAnimation.setFromX(-cloudView.getImage().getWidth() * 1.75);
        cloudAnimation.setToX(cloudView.getImage().getHeight() * 1.75);
        cloudAnimation.setCycleCount(TranslateTransition.INDEFINITE);
        cloudAnimation.setInterpolator(javafx.animation.Interpolator.LINEAR);
        cloudAnimation.play();
    }

    public void addTerritories(List<Territory> territories) {
        for (Territory territory : territories) {
            String imagePath = "/img/territories/" + (territory.getPanelImg() != null ? territory.getPanelImg() : "error.png");
            Image territoryImage = new Image(Objects.requireNonNull(getClass().getResourceAsStream(imagePath)));

            // Territory button
            double radius = 30; // Button size
            Circle border = new Circle(radius + 2, Color.WHITE);
            Circle territoryButton = new Circle(radius, new ImagePattern(territoryImage));

            border.setCenterX(territory.getX());
            border.setCenterY(territory.getY());
            territoryButton.setCenterX(territory.getX());
            territoryButton.setCenterY(territory.getY());

            // When territory is hovered
            territoryButton.setOnMouseEntered(event -> {
                if (currentSelectedTerritory != border) {
                    border.setFill(Color.rgb(179, 134, 0));
                }
            });
            territoryButton.setOnMouseExited(event -> {
                if (currentSelectedTerritory != border) {
                    border.setFill(Color.WHITE);
                }
            });

            // When territory is clicked
            territoryButton.setOnMouseClicked(event -> {
                if (currentSelectedTerritory != null) {
                    currentSelectedTerritory.setFill(Color.WHITE);
                }
                border.setFill(Color.GOLD);
                currentSelectedTerritory = border;

                // Notify callback of selected territory
                callback.onTerritorySelected(territory);
            });

            mapGroup.getChildren().addAll(border, territoryButton);
        }
    }

    public void resetSelection() {
        if (currentSelectedTerritory != null) {
            currentSelectedTerritory.setFill(Color.WHITE);
            currentSelectedTerritory = null;
        }
    }

    public Node getView() {
        return scrollPane;
    }
}
