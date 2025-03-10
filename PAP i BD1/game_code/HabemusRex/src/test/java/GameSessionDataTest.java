import org.habemusrex.cachedData.GameSessionData;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class GameSessionDataTest {
    static private GameSessionData GameSessionData;
    @BeforeAll
    static public void setUp() {
        Configuration configuration = new Configuration();
        configuration.configure("hibernate.cfg.xml");
        try (SessionFactory sessionFactory = configuration.buildSessionFactory(); Session session = sessionFactory.openSession()) {
            GameSessionData sessionData = new GameSessionData();
            sessionData.loadData(session);
            GameSessionData = sessionData;
        }

    }

    @Test
    public void testGetCurrentSession() {
        assertEquals(1, GameSessionData.getCurrentSession().getSessionId());
        assertEquals(1, GameSessionData.getCurrentSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getCurrentSession().getUser().getName());
    }

    @Test
    public void testGetCurrentUser() {
        assertEquals(1, GameSessionData.getCurrentUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getCurrentUser().getName());
    }

    @Test
    public void testGetArmies() {
        assertEquals(1, GameSessionData.getArmies().get(0).getArmyId());

        assertEquals(1, GameSessionData.getArmies().get(0).getSession().getSessionId());
        assertEquals(1, GameSessionData.getArmies().get(0).getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getArmies().get(0).getSession().getUser().getName());

        assertEquals(1, GameSessionData.getArmies().get(0).getPlayer().getPlayerId());
        assertEquals(1, GameSessionData.getArmies().get(0).getPlayer().getSession().getSessionId());
        assertEquals(1, GameSessionData.getArmies().get(0).getPlayer().getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getArmies().get(0).getPlayer().getSession().getUser().getName());
        assertEquals(1, GameSessionData.getArmies().get(0).getPlayer().getFraction().getFractionId());
        assertEquals("Rzeczpospolita Obojga Narodów", GameSessionData.getArmies().get(0).getPlayer().getFraction().getDescription());
        assertEquals("Rzeczpospolita", GameSessionData.getArmies().get(0).getPlayer().getFraction().getName());
        assertEquals("USER", GameSessionData.getArmies().get(0).getPlayer().getType().toString());

        assertEquals(1, GameSessionData.getArmies().get(0).getArmyType().getUnitId());
        assertEquals("Biedna piechota", GameSessionData.getArmies().get(0).getArmyType().getName());
        assertEquals("Każdy walczyć może", GameSessionData.getArmies().get(0).getArmyType().getDescription());
        assertEquals("biedna_piechota.jpg", GameSessionData.getArmies().get(0).getArmyType().getImage());
        assertEquals(5, GameSessionData.getArmies().get(0).getArmyType().getDefensiveStrength());
        assertEquals(5, GameSessionData.getArmies().get(0).getArmyType().getOffensiveStrength());

        assertEquals(1, GameSessionData.getArmies().get(0).getSize());
    }

    @Test
    public void testGetBattles() {
        assertEquals(1, GameSessionData.getBattles().get(0).getBattleId());

        assertEquals(1, GameSessionData.getBattles().get(0).getSession().getSessionId());
        assertEquals(1, GameSessionData.getBattles().get(0).getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getBattles().get(0).getSession().getUser().getName());

        assertEquals(1, GameSessionData.getBattles().get(0).getLocation().getTerritoryId());
        assertEquals("Warszawa", GameSessionData.getBattles().get(0).getLocation().getName());
        assertEquals("warsaw.png", GameSessionData.getBattles().get(0).getLocation().getPanelImg());
        assertEquals(2995, GameSessionData.getBattles().get(0).getLocation().getX());
        assertEquals(1956, GameSessionData.getBattles().get(0).getLocation().getY());
        assertEquals("city", GameSessionData.getBattles().get(0).getLocation().getTerritoryType().toString());
        assertEquals("Stolica Polski", GameSessionData.getBattles().get(0).getLocation().getDescription());
        assertEquals("PLAINS", GameSessionData.getBattles().get(0).getLocation().getGeography().toString());

        assertEquals("ATTACKER_VICTORY", GameSessionData.getBattles().get(0).getOutcome().toString());
    }

    @Test
    public void testGetConstructions() {
        assertEquals(1, GameSessionData.getConstructions().get(0).getConstructionId());
        assertEquals("Warszawa", GameSessionData.getConstructions().get(0).getTerritory().getName());
        assertEquals(1, GameSessionData.getConstructions().get(0).getSession().getSessionId());

        assertEquals(1, GameSessionData.getConstructions().get(0).getBuilding().getBuildingId());
        assertEquals("castle.png", GameSessionData.getConstructions().get(0).getBuilding().getBuildingImg());
        assertEquals("Fortyfikacje", GameSessionData.getConstructions().get(0).getBuilding().getName());
        assertEquals("Zacny szaniec mospanie!", GameSessionData.getConstructions().get(0).getBuilding().getDescription());
    }

    @Test
    public void testGetConstructionsForTerritory() {
        assertEquals(1, GameSessionData.getConstructionsForTerritory(GameSessionData.getBattles().get(0).getLocation()).get(0).getConstructionId());
        assertEquals("Warszawa", GameSessionData.getConstructionsForTerritory(GameSessionData.getBattles().get(0).getLocation()).get(0).getTerritory().getName());
        assertEquals(1, GameSessionData.getConstructionsForTerritory(GameSessionData.getBattles().get(0).getLocation()).get(0).getSession().getSessionId());

        assertEquals(1, GameSessionData.getConstructionsForTerritory(GameSessionData.getBattles().get(0).getLocation()).get(0).getBuilding().getBuildingId());
        assertEquals("castle.png", GameSessionData.getConstructionsForTerritory(GameSessionData.getBattles().get(0).getLocation()).get(0).getBuilding().getBuildingImg());
        assertEquals("Fortyfikacje", GameSessionData.getConstructionsForTerritory(GameSessionData.getBattles().get(0).getLocation()).get(0).getBuilding().getName());
        assertEquals("Zacny szaniec mospanie!", GameSessionData.getConstructionsForTerritory(GameSessionData.getBattles().get(0).getLocation()).get(0).getBuilding().getDescription());
    }

    @Test
    public void testGetCurrentPlayerResources() {
        assertEquals(1, GameSessionData.getCurrentPlayerResources().get(0).getPlayer().getPlayerId());
        assertEquals(1, GameSessionData.getCurrentPlayerResources().get(0).getPlayer().getSession().getSessionId());
        assertEquals(1, GameSessionData.getCurrentPlayerResources().get(0).getPlayer().getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getCurrentPlayerResources().get(0).getPlayer().getSession().getUser().getName());
        assertEquals(1, GameSessionData.getCurrentPlayerResources().get(0).getResource().getResourceId());
        assertEquals("Złoto", GameSessionData.getCurrentPlayerResources().get(0).getResource().getName());
        assertEquals(500, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
    }

    @Test
    public void testGetCurrentPlayerResourceQuantity() {
        assertEquals(1500, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
    }

    @Test
    public void testGetPlayers() {
        assertEquals(1, GameSessionData.getPlayers().get(0).getPlayerId());
        assertEquals(1, GameSessionData.getPlayers().get(0).getSession().getSessionId());
        assertEquals(1, GameSessionData.getPlayers().get(0).getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getPlayers().get(0).getSession().getUser().getName());
        assertEquals(1, GameSessionData.getPlayers().get(0).getFraction().getFractionId());
        assertEquals("Rzeczpospolita Obojga Narodów", GameSessionData.getPlayers().get(0).getFraction().getDescription());
        assertEquals("Rzeczpospolita", GameSessionData.getPlayers().get(0).getFraction().getName());
        assertEquals("USER", GameSessionData.getPlayers().get(0).getType().toString());
    }

    @Test
    public void testGetCurrentPlayer() {
        assertEquals(1, GameSessionData.getCurrentPlayer().getPlayerId());
        assertEquals(1, GameSessionData.getCurrentPlayer().getSession().getSessionId());
        assertEquals(1, GameSessionData.getCurrentPlayer().getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getCurrentPlayer().getSession().getUser().getName());
        assertEquals(1, GameSessionData.getCurrentPlayer().getFraction().getFractionId());
        assertEquals("Rzeczpospolita Obojga Narodów", GameSessionData.getCurrentPlayer().getFraction().getDescription());
        assertEquals("Rzeczpospolita", GameSessionData.getCurrentPlayer().getFraction().getName());
        assertEquals("USER", GameSessionData.getCurrentPlayer().getType().toString());
    }

    @Test
    public void testAddArmy() {
        int armyCount = GameSessionData.getArmies().size();
        GameSessionData.addArmy(GameSessionData.getArmies().get(0));
        assertEquals(armyCount + 1, GameSessionData.getArmies().size());
        assertEquals(GameSessionData.getArmies().get(0).getArmyId(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getArmyId());
        assertEquals(GameSessionData.getArmies().get(0).getArmyType().getUnitId(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getArmyType().getUnitId());
        assertEquals(GameSessionData.getArmies().get(0).getSize(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getSize());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getPlayerId(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getPlayerId());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getSession().getSessionId(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getSession().getSessionId());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getSession().getUser().getUserId(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getSession().getUser().getUserId());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getSession().getUser().getName(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getSession().getUser().getName());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getFraction().getFractionId(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getFraction().getFractionId());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getFraction().getDescription(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getFraction().getDescription());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getFraction().getName(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getFraction().getName());
        assertEquals(GameSessionData.getArmies().get(0).getPlayer().getType().toString(), GameSessionData.getArmies().get(GameSessionData.getArmies().size() - 1).getPlayer().getType().toString());
    }

    @Test
    public void testAddBattle() {
        int battleCount = GameSessionData.getBattles().size();
        GameSessionData.addBattle(GameSessionData.getBattles().get(0));
        assertEquals(battleCount + 1, GameSessionData.getBattles().size());
        assertEquals(GameSessionData.getBattles().get(0).getBattleId(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getBattleId());
        assertEquals(GameSessionData.getBattles().get(0).getSession().getSessionId(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getSession().getSessionId());
        assertEquals(GameSessionData.getBattles().get(0).getSession().getUser().getUserId(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getSession().getUser().getUserId());
        assertEquals(GameSessionData.getBattles().get(0).getSession().getUser().getName(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getSession().getUser().getName());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getTerritoryId(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getTerritoryId());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getName(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getName());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getPanelImg(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getPanelImg());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getX(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getX());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getY(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getY());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getTerritoryType().toString(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getTerritoryType().toString());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getDescription(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getDescription());
        assertEquals(GameSessionData.getBattles().get(0).getLocation().getGeography().toString(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getLocation().getGeography().toString());
        assertEquals(GameSessionData.getBattles().get(0).getOutcome().toString(), GameSessionData.getBattles().get(GameSessionData.getBattles().size() - 1).getOutcome().toString());
    }

    @Test
    public void testAddConstruction() {
        int constructionCount = GameSessionData.getConstructions().size();
        GameSessionData.addConstruction(GameSessionData.getConstructions().get(0));
        assertEquals(constructionCount + 1, GameSessionData.getConstructions().size());
        assertEquals(GameSessionData.getConstructions().get(0).getConstructionId(), GameSessionData.getConstructions().get(GameSessionData.getConstructions().size() - 1).getConstructionId());
        assertEquals(GameSessionData.getConstructions().get(0).getTerritory().getName(), GameSessionData.getConstructions().get(GameSessionData.getConstructions().size() - 1).getTerritory().getName());
        assertEquals(GameSessionData.getConstructions().get(0).getSession().getSessionId(), GameSessionData.getConstructions().get(GameSessionData.getConstructions().size() - 1).getSession().getSessionId());
        assertEquals(GameSessionData.getConstructions().get(0).getBuilding().getBuildingId(), GameSessionData.getConstructions().get(GameSessionData.getConstructions().size() - 1).getBuilding().getBuildingId());
        assertEquals(GameSessionData.getConstructions().get(0).getBuilding().getBuildingImg(), GameSessionData.getConstructions().get(GameSessionData.getConstructions().size() - 1).getBuilding().getBuildingImg());
        assertEquals(GameSessionData.getConstructions().get(0).getBuilding().getName(), GameSessionData.getConstructions().get(GameSessionData.getConstructions().size() - 1).getBuilding().getName());
        assertEquals(GameSessionData.getConstructions().get(0).getBuilding().getDescription(), GameSessionData.getConstructions().get(GameSessionData.getConstructions().size() - 1).getBuilding().getDescription());
    }

    @Test
    public void testGetCurrentSessionId() {
        assertEquals(1, GameSessionData.getCurrentSessionId());
    }

    @Test
    public void testGetArmyOfPlayer() {
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getArmyId());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getSession().getSessionId());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getArmyOfPlayer(1).get(0).getSession().getUser().getName());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getPlayerId());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getSession().getSessionId());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getSession().getUser().getName());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getFraction().getFractionId());
        assertEquals("Rzeczpospolita Obojga Narodów", GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getFraction().getDescription());
        assertEquals("Rzeczpospolita", GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getFraction().getName());
        assertEquals("USER", GameSessionData.getArmyOfPlayer(1).get(0).getPlayer().getType().toString());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getArmyType().getUnitId());
        assertEquals("Biedna piechota", GameSessionData.getArmyOfPlayer(1).get(0).getArmyType().getName());
        assertEquals("Każdy walczyć może", GameSessionData.getArmyOfPlayer(1).get(0).getArmyType().getDescription());
        assertEquals("biedna_piechota.jpg", GameSessionData.getArmyOfPlayer(1).get(0).getArmyType().getImage());
        assertEquals(5, GameSessionData.getArmyOfPlayer(1).get(0).getArmyType().getDefensiveStrength());
        assertEquals(5, GameSessionData.getArmyOfPlayer(1).get(0).getArmyType().getOffensiveStrength());
        assertEquals(1, GameSessionData.getArmyOfPlayer(1).get(0).getSize());
    }

    @Test
    public void testAddPlayerResource() {
        int playerResourceCount = GameSessionData.getCurrentPlayerResources().size();
        GameSessionData.addPlayerResource(GameSessionData.getPlayers().get(0), GameSessionData.getCurrentPlayerResources().get(0).getResource(), 1000);
        assertEquals(playerResourceCount, GameSessionData.getCurrentPlayerResources().size());
        assertEquals(1500, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
    }

    @Test
    public void testSubtractPlayerResource() {
        int playerResourceCount = GameSessionData.getCurrentPlayerResources().size();
        GameSessionData.subtractPlayerResource(GameSessionData.getPlayers().get(0), GameSessionData.getCurrentPlayerResources().get(0).getResource(), 500);
        assertEquals(playerResourceCount, GameSessionData.getCurrentPlayerResources().size());
        assertEquals(500, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
    }

    @Test
    public void testDeleteArmyEntry() {
        int armyCount = GameSessionData.getArmies().size();
        GameSessionData.deleteArmyEntry(GameSessionData.getArmies().get(4));
        assertEquals(armyCount - 1, GameSessionData.getArmies().size());
    }

    @Test
    public void testGetMaxArmyId() {
        assertEquals(4, GameSessionData.getMaxArmyId());
    }

    @Test
    public void testGetUnitCountFor() {
        assertEquals(2, GameSessionData.getUnitCountFor(GameSessionData.getPlayers().get(0), GameSessionData.getArmies().get(0).getArmyType().getUnitId()));
    }

    @Test
    public void testGetEnemies() {
        assertEquals(3, GameSessionData.getEnemies().size());
        assertEquals(2, GameSessionData.getEnemies().get(0).getPlayerId());
        assertEquals(1, GameSessionData.getEnemies().get(0).getSession().getSessionId());
        assertEquals(1, GameSessionData.getEnemies().get(0).getSession().getUser().getUserId());
        assertEquals("AI", GameSessionData.getEnemies().get(0).getType().toString());
    }

    @Test
    public void testGetResourcesOf() {
        assertEquals(1000, GameSessionData.getResourcesOf(2, 1));
    }

    @Test
    public void testGetAllResourcesOf() {
        assertEquals(1000, GameSessionData.getAllResourcesOf(2).get(0).getQuantity());
        assertEquals("Złoto", GameSessionData.getAllResourcesOf(2).get(0).getResource().getName());
        assertEquals(1, GameSessionData.getAllResourcesOf(2).get(0).getResource().getResourceId());
        assertEquals("Prusy", GameSessionData.getAllResourcesOf(2).get(0).getPlayer().getFraction().getName());
        assertEquals(2, GameSessionData.getAllResourcesOf(2).get(0).getPlayer().getPlayerId());
        assertEquals(1, GameSessionData.getAllResourcesOf(2).get(0).getPlayer().getSession().getSessionId());
        assertEquals(1, GameSessionData.getAllResourcesOf(2).get(0).getPlayer().getSession().getUser().getUserId());
        assertEquals("AI", GameSessionData.getAllResourcesOf(2).get(0).getPlayer().getType().toString());
    }

    @Test
    public void testGetTotalUnitsOf() {
        assertEquals(4, GameSessionData.getTotalUnitsOf(1));
        assertEquals(1, GameSessionData.getTotalUnitsOf(2));
    }

    @Test
    public void testGetOffensiveStrengthFor() {
        assertEquals(45, GameSessionData.getOffensiveStrengthFor(1));
        assertEquals(5, GameSessionData.getOffensiveStrengthFor(2));
    }

    @Test
    public void testGetDefensiveStrengthFor() {
        assertEquals(50, GameSessionData.getDefensiveStrengthFor(1));
        assertEquals(5, GameSessionData.getDefensiveStrengthFor(2));
    }

    @Test
    public void testChangeOwnership() {
        GameSessionData.changeOwnership(12, GameSessionData.getPlayers().get(0));
        assertEquals(GameSessionData.getPlayers().get(0), GameSessionData.getOwnership(12).getPlayer());
    }

    @Test
    public void testGetOwnership() {
        assertEquals(1, GameSessionData.getOwnership(1).getTerritory().getTerritoryId());
        assertEquals(1, GameSessionData.getOwnership(1).getPlayer().getPlayerId());
        assertEquals(1, GameSessionData.getOwnership(1).getPlayer().getSession().getSessionId());
        assertEquals(1, GameSessionData.getOwnership(1).getPlayer().getSession().getUser().getUserId());
        assertEquals("Michał Wiśniewski", GameSessionData.getOwnership(1).getPlayer().getSession().getUser().getName());
        assertEquals(1, GameSessionData.getOwnership(1).getPlayer().getFraction().getFractionId());
        assertEquals("Rzeczpospolita Obojga Narodów", GameSessionData.getOwnership(1).getPlayer().getFraction().getDescription());
        assertEquals("Rzeczpospolita", GameSessionData.getOwnership(1).getPlayer().getFraction().getName());
        assertEquals("USER", GameSessionData.getOwnership(1).getPlayer().getType().toString());
    }

    @Test
    public void testGetTerritoriesOf() {
        assertEquals(1, GameSessionData.getTerritoriesOf(1).get(0).getTerritoryId());
        assertEquals("Warszawa", GameSessionData.getTerritoriesOf(1).get(0).getName());
        assertEquals("warsaw.png", GameSessionData.getTerritoriesOf(1).get(0).getPanelImg());
        assertEquals(2995, GameSessionData.getTerritoriesOf(1).get(0).getX());
        assertEquals(1956, GameSessionData.getTerritoriesOf(1).get(0).getY());
        assertEquals("city", GameSessionData.getTerritoriesOf(1).get(0).getTerritoryType().toString());
        assertEquals("Stolica Polski", GameSessionData.getTerritoriesOf(1).get(0).getDescription());
        assertEquals("PLAINS", GameSessionData.getTerritoriesOf(1).get(0).getGeography().toString());
    }

    @Test
    public void testUpdateScores() {
        GameSessionData.updateScores();
        assertEquals(22, GameSessionData.getPlayerScore(1));
        assertEquals(6, GameSessionData.getPlayerScore(2));
    }

    @Test
    public void testCheckForWinner() {
        assertEquals(GameSessionData.getPlayers().get(0), GameSessionData.checkForWinner());
        GameSessionData.changeOwnership(6, GameSessionData.getPlayers().get(1));
        assertNull(GameSessionData.checkForWinner());
    }
}
