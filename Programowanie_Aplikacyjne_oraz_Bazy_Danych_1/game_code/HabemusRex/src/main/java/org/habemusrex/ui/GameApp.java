package org.habemusrex.ui;

import javafx.application.Application;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;
import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.enemyLogic.EnemyLogic;
import org.habemusrex.entities.Player;
import org.habemusrex.entities.Territory;
import org.habemusrex.media.MediaManager;

import java.util.List;
import java.util.Objects;

public class GameApp extends Application {
    private static final boolean SKIP_START_MENU = false;

    private static GameSessionData sessionData;

    private TopBar topBar;
    private TerritoryPanel territoryPanel;
    private MapHandler mapHandler;
    private ScoreboardMenu scoreboardMenu;
    private HelpMenu helpMenu;
    private ExitMenu exitMenu;
    private MediaManager mediaManager;
    private NextTurnButton nextTurnButton;
    private ArmyMenu armyMenu;
    private EnemyLogic enemyLogic;
    private ResultMenu resultMenu;
    private Notification notification;

    private int turn = 1;

    public static void setSessionData(GameSessionData sessionData) {
        GameApp.sessionData = sessionData;
    }

    @Override
    public void start(Stage primaryStage) {
        if (sessionData == null) {
            throw new IllegalStateException("GameSessionData is not initialized. Call GameApp.setSessionData() before launching.");
        }

        // Root
        StackPane root = new StackPane();
        root.setPrefWidth(Double.MAX_VALUE);
        root.setPrefHeight(Double.MAX_VALUE);

        // Scene
        Scene scene = new Scene(root, 1280, 720);
        primaryStage.setTitle("Habemus Rex!");
        primaryStage.setScene(scene);

        // App icon
        primaryStage.getIcons().add(new javafx.scene.image.Image(Objects.requireNonNull(getClass().getResourceAsStream("/icons/icon.png"))));

        // Start menu
        if (!SKIP_START_MENU) {
            StartMenu startMenu = new StartMenu();
            startMenu.getPlayButton().setOnAction(event -> {
                root.getChildren().clear();
                gameUI(root, primaryStage);
            });
            root.getChildren().add(startMenu);
        } else {
            gameUI(root, primaryStage);
        }

        primaryStage.show();
    }

    private void gameUI(StackPane root, Stage primaryStage) {
        // Initialize
        mediaManager = new MediaManager();
        topBar = new TopBar(sessionData);
        topBar.getMenuButton().setOnAction(event -> exitMenu.show());
        topBar.getArmyButton().setOnAction(event -> armyMenu.openMenu(sessionData));
        territoryPanel = new TerritoryPanel();
        territoryPanel.setOnCloseCallback(() -> mapHandler.resetSelection());
        territoryPanel.setOnBuildingBuiltCallback(() -> topBar.updateResources());
        territoryPanel.setOnBattleEndedCallback(() -> topBar.updateResources());
        armyMenu = new ArmyMenu();
        armyMenu.setOnArmyChangeCallback(() -> topBar.updateResources());
        armyMenu.setOnTurnConsumptionCallback(() -> topBar.updateResources());
        enemyLogic = new EnemyLogic(sessionData, armyMenu);
        notification = new Notification();

        mapHandler = new MapHandler(this::onTerritorySelected);

        scoreboardMenu = new ScoreboardMenu(sessionData);
        topBar.setScoreboardMenu(scoreboardMenu);

        helpMenu = new HelpMenu();
        topBar.setHelpMenu(helpMenu);

        exitMenu = new ExitMenu(() -> {
            sessionData.saveData();
            System.out.println("Thanks for playing Habemus Rex!");
            System.exit(0);
        }, () -> {
            sessionData.saveData();
            exitMenu.close();
        });

        resultMenu = new ResultMenu(exitMenu, () -> {
            System.out.println("Continuing game after victory! (it's too fun to stop playing)");
        });

        // Pass sessionData to NextTurnButton
        nextTurnButton = new NextTurnButton(turn, this::onNextTurn, sessionData, resultMenu, false,
                notification);

        // Load static data
        List<Territory> territories = StaticDataCache.getTerritories();
        mapHandler.addTerritories(territories);

        // Play music
        mediaManager.playLoopingTrack("/audio/music/soundtrack1.mp3", 0.1);
        mediaManager.playLoopingTrack("/audio/ambience/nature_ambience.mp3", 0.5);

        root.getChildren().addAll(
                mapHandler.getView(),      // Map view
                territoryPanel,           // Territory details panel
                topBar,                   // Top bar
                nextTurnButton,           // Next turn button
                notification,
                armyMenu,
                scoreboardMenu,
                helpMenu,
                resultMenu,
                exitMenu
        );

        StackPane.setAlignment(territoryPanel, javafx.geometry.Pos.TOP_LEFT);
        StackPane.setAlignment(topBar, javafx.geometry.Pos.TOP_CENTER);
        StackPane.setAlignment(nextTurnButton, javafx.geometry.Pos.BOTTOM_RIGHT);
        StackPane.setAlignment(armyMenu, javafx.geometry.Pos.TOP_RIGHT);
        StackPane.setAlignment(scoreboardMenu, Pos.TOP_RIGHT);
        StackPane.setAlignment(notification, Pos.TOP_CENTER);
        topBar.updateResources();
        sessionData.updateScores();
        // Shutdown on close
        primaryStage.setOnCloseRequest(event -> {
            mediaManager.shutdown();
            System.out.println("Closing.");
            System.out.println("Game was not saved - to save the game, use the menu button.");
            System.out.println("Thanks for playing Habemus Rex!");
            System.exit(0);
        });
    }

    private void onTerritorySelected(Territory territory) {
        System.out.println("Selected Territory: " + territory.getName());
        mediaManager.playSoundEffect("/audio/sounds/open.mp3");
        territoryPanel.showTerritoryDetails(territory, sessionData);
    }

    private void onNextTurn() {
        turn++;
        List<Player> players = sessionData.getPlayers();
        int killed = 0;
        for(Player player: players) {
            if (Objects.equals(player.getPlayerId(), sessionData.getCurrentPlayer().getPlayerId())) {
                killed = armyMenu.armyResourceConsume(sessionData, player);
            }
            else{
                armyMenu.armyResourceConsume(sessionData, player);
            }
        }
        if (killed > 0) {
            notification.show(
                    "TWOJE JEDNOSTKI ZDEZERTEROWAŁY!",
                    killed + " twoich jednostek zdezerterowało!",
                    5.0
            );
        }
        topBar.updateTurn(turn);
        topBar.updateResources();
        mediaManager.playSoundEffect("/audio/sounds/next_turn.mp3");
        System.out.println("Next turn. Turn: " + turn);
        enemyLogic.enemyRecruitUnitPhase();
        enemyLogic.enemyBuildPhase();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
