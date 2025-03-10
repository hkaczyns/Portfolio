import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.ui.NextTurnButton;
import org.habemusrex.ui.Notification;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.habemusrex.entities.Construction;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class NextTurnButtonTest {
    static private GameSessionData GameSessionData;
    static private StaticDataCache StaticDataCache;
    static private NextTurnButton NextTurnButton;
    static private Notification Notification;

    @BeforeEach
    public void setUp() {
        Configuration configuration = new Configuration();
        configuration.configure("hibernate.cfg.xml");
        try (SessionFactory sessionFactory = configuration.buildSessionFactory(); Session session = sessionFactory.openSession()) {
            GameSessionData sessionData = new GameSessionData();
            Notification = new Notification();
            NextTurnButton = new NextTurnButton(1, () -> {
            }, sessionData, null, true, Notification);
            sessionData.loadData(session);
            GameSessionData = sessionData;
            StaticDataCache = new StaticDataCache();
            StaticDataCache.loadStaticData(session);
        }
    }

    @Test
    public void testHandleNextTurnGetTurn() {
        NextTurnButton.handleNextTurn();
        assertEquals(2, NextTurnButton.getTurn());
    }

    @Test
    public void testHandleNextUpdatePlayerGetCurrentPlayerResourceQuantity() {
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
        NextTurnButton.handleNextTurn();
        assertEquals(990, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(1070, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(1060, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1010, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
    }

    @Test
    public void testHandleNextUpdatePlayerGetCurrentPlayerResources() {
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
        NextTurnButton.handleNextTurn();
        assertEquals(990, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(1070, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(1060, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1010, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
    }

    @Test
    public void testHandleNextUpdatePlayerGetAllResourcesOf() {
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(4).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(4).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(4).getQuantity());
        NextTurnButton.handleNextTurn();
        assertEquals(990, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(1070, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(1060, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1010, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(2).get(0).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(2).get(1).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(2).get(2).getQuantity());
        assertEquals(1010, GameSessionData.getAllResourcesOf(2).get(3).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(2).get(4).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(3).get(0).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(3).get(1).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(3).get(2).getQuantity());
        assertEquals(1010, GameSessionData.getAllResourcesOf(3).get(3).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(3).get(4).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(4).get(0).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(4).get(1).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(4).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(3).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(4).get(4).getQuantity());
    }

    @Test
    public void testHandleNextTurnScores() {
        assertEquals(0, GameSessionData.getPlayerScore(1));
        GameSessionData.updateScores();
        assertEquals(19, GameSessionData.getPlayerScore(1));
        Construction construction = new Construction();
        construction.setTerritory(StaticDataCache.getTerritories().get(5));
        construction.setBuilding(StaticDataCache.getBuildingInfos().get(0));
        construction.setSession(GameSessionData.getCurrentSession());
        construction.setConstructionId(1);
        GameSessionData.addConstruction(construction);
        NextTurnButton.handleNextTurn();
        assertEquals(20, GameSessionData.getPlayerScore(1));
    }

    @Test
    public void testUpdatePlayerResourcesGetCurrentPlayerResourceQuantity() {
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
        NextTurnButton.updatePlayerResources();
        assertEquals(990, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(1070, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(1060, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1010, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
    }

    @Test
    public void  testUpdatePlayerResourcesGetCurrentPlayerResources() {
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
        NextTurnButton.updatePlayerResources();
        assertEquals(990, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(1070, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(1060, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1010, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
    }

    @Test
    public void  testUpdatePlayerResourcesGetAllResourcesOf() {
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(4).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(3).get(4).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(4).getQuantity());
        NextTurnButton.updatePlayerResources();
        assertEquals(990, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(1070, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(1060, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1010, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(2).get(0).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(2).get(1).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(2).get(2).getQuantity());
        assertEquals(1010, GameSessionData.getAllResourcesOf(2).get(3).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(2).get(4).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(3).get(0).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(3).get(1).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(3).get(2).getQuantity());
        assertEquals(1010, GameSessionData.getAllResourcesOf(3).get(3).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(3).get(4).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(4).get(0).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(4).get(1).getQuantity());
        assertEquals(980, GameSessionData.getAllResourcesOf(4).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(4).get(3).getQuantity());
        assertEquals(1030, GameSessionData.getAllResourcesOf(4).get(4).getQuantity());
    }
}