package org.habemusrex.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.TextAlignment;

import java.util.Objects;

public class HelpMenu extends VBox {

    public HelpMenu() {
        super(10);

        setPadding(new Insets(20));
        setStyle("-fx-background-color: rgba(39, 26, 12, 0.8);");
        setMaxWidth(800);
        setMaxHeight(600);
        StackPane.setMargin(this, new Insets(50, 0, 0, 350));
        setVisible(false);

        // Close button
        Button closeButton = getCloseButton();
        getChildren().add(closeButton);

        // Label
        Label titleLabel = new Label("INSTRUKCJA GRY");
        titleLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 36));
        titleLabel.setStyle("-fx-text-fill: white; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");
        titleLabel.setMaxWidth(Double.MAX_VALUE);
        titleLabel.setAlignment(Pos.CENTER);
        getChildren().add(titleLabel);

        ScrollPane scrollPane = createScrollableContent();
        VBox.setVgrow(scrollPane, Priority.ALWAYS);
        getChildren().add(scrollPane);
    }

    private ScrollPane createScrollableContent() {
        VBox contentContainer = new VBox(30);
        contentContainer.setPadding(new Insets(20));
        contentContainer.setStyle("-fx-background-color: transparent;");

        // Help menu sections
        contentContainer.getChildren().addAll(
                createSection(
                        "POLA",
                        "Każde pole reprezentuje terytorium, które możesz podbić i kontrolować. " +
                                "Terytoria są kluczowe dla zwycięstwa - za każde kontrolowane terytorium otrzymujesz jeden punkt. " +
                                "Aby zobaczyć szczegóły terytorium, kliknij na nie na mapie.",
                        "/img/help/territories.png"
                ),
                createSection(
                        "BUDYNKI",
                        "Budynki są źródłem zasobów i punktów zwycięstwa. Każdy budynek generuje określone zasoby co turę, " +
                                "ale wymaga również utrzymania. Za każdy posiadany budynek otrzymujesz jeden punkt. " +
                                "Aby wybudować budynek, kliknij na terytorium, następnie \"Przejdź do miasta\" " +
                                "i w panelu budynków kliknij \"Buduj\".",
                        "/img/help/buildings.png"
                ),
                createSection(
                        "ARMIA",
                        "Armia jest kluczowa do ekspansji twojego imperium. Różne jednostki mają różne koszty rekrutacji " +
                                "i utrzymania. Każda jednostka ma określoną siłę ataku i obrony. Aby zrekrutować jednostki," +
                                "wejdź do panelu \"Armia\" i kliknij \"Rekrutuj\".",
                        "/img/help/army.png"
                ),
                createSection(
                        "WOJNA",
                        "Wojna to sposób na zdobycie nowych terytoriów. Aby podbić terytorium, musisz najpierw " +
                                "zgromadzić odpowiednią armię. Następnie kliknij na nienależące do ciebie terytorium, które " +
                                "chcesz zaatakować i kliknij \"Podbij\", a później \"Do ataku!\". Gra pokaże" +
                                "ostateczny wynik bitwy.",
                        "/img/help/battle.png"
                )
        );

        ScrollPane scrollPane = new ScrollPane(contentContainer);
        scrollPane.setStyle("-fx-background: transparent; -fx-background-color: transparent;");
        scrollPane.setFitToWidth(true);
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setVbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);

        return scrollPane;
    }

    private HBox createSection(String title, String content, String imagePath) {
        HBox section = new HBox(20);
        section.setStyle("-fx-background-color: rgba(77, 51, 25, 0.6); -fx-background-radius: 10; -fx-padding: 15;");

        // Text content
        VBox textContent = new VBox(10);
        textContent.setPrefWidth(500);

        // Section title
        Label titleLabel = new Label(title);
        titleLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 24));
        titleLabel.setStyle("-fx-text-fill: gold; -fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");

        // Section content
        Label contentLabel = new Label(content);
        contentLabel.setFont(Font.loadFont(getClass().getResourceAsStream("/fonts/PirataOne-Regular.ttf"), 16));
        contentLabel.setStyle("-fx-text-fill: white;");
        contentLabel.setWrapText(true);
        contentLabel.setTextAlignment(TextAlignment.JUSTIFY);

        textContent.getChildren().addAll(titleLabel, contentLabel);

        // Image (if null, just show text)
        try {
            Image image = new Image(Objects.requireNonNull(getClass().getResourceAsStream(imagePath)));
            ImageView imageView = new ImageView(image);
            imageView.setFitWidth(200);
            imageView.setPreserveRatio(true);
            imageView.setStyle("-fx-effect: dropshadow(three-pass-box, black, 10, 0.5, 0, 0);");

            section.getChildren().addAll(textContent, imageView);
        } catch (Exception e) {
            System.out.println("Could not load help image: " + imagePath);
            section.getChildren().add(textContent);
        }

        return section;
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

    public void show() {
        setVisible(true);
    }

    public void close() {
        setVisible(false);
    }
}