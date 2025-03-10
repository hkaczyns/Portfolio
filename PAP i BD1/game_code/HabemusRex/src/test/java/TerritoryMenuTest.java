import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.entities.BuildingInfo;
import org.habemusrex.entities.Player;
import org.habemusrex.entities.Territory;
import org.habemusrex.ui.TerritoryMenu;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TerritoryMenuTest {
    static private GameSessionData GameSessionData;
    static private StaticDataCache StaticDataCache;
    static private TerritoryMenu TerritoryMenu;

    @BeforeEach
    public void setUp() {
        Configuration configuration = new Configuration();
        configuration.configure("hibernate.cfg.xml");
        try (SessionFactory sessionFactory = configuration.buildSessionFactory(); Session session = sessionFactory.openSession()) {
            GameSessionData sessionData = new GameSessionData();
            TerritoryMenu = new TerritoryMenu();
            sessionData.loadData(session);
            GameSessionData = sessionData;
            StaticDataCache = new StaticDataCache();
            StaticDataCache.loadStaticData(session);
        }
    }

    @Test
    public void testBuildBuildingCount() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(21, GameSessionData.getConstructions().size());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(22, GameSessionData.getConstructions().size());
    }

    @Test
    public void testBuildBuildingTerritoryCount() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1, GameSessionData.getConstructionsForTerritory(territory).size());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(2, GameSessionData.getConstructionsForTerritory(territory).size());
    }

    @Test
    public void testBuildBuildingTerritoryScore() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        GameSessionData.updateScores();
        assertEquals(19, GameSessionData.getPlayerScore(1));
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        GameSessionData.updateScores();
        assertEquals(20, GameSessionData.getPlayerScore(1));
    }

    @Test
    public void testBuildBuildingTerritoryGetCurrentPlayerResourceQuantity() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(800, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(800, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
    }

    @Test
    public void testBuildBuildingTerritoryGetCurrentPlayerResourcesy() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(800, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(800, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
    }

    @Test
    public void testBuildBuildingTerritoryGetAllResourcesOf() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(800, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(800, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
    }

    @Test
    public void testBuildBuilding2Count() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(21, GameSessionData.getConstructions().size());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        buildingInfo = StaticDataCache.getBuildingInfos().get(1);
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(23, GameSessionData.getConstructions().size());
    }

    @Test
    public void testBuildBuilding2TerritoryCount() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1, GameSessionData.getConstructionsForTerritory(territory).size());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        buildingInfo = StaticDataCache.getBuildingInfos().get(1);
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(3, GameSessionData.getConstructionsForTerritory(territory).size());
    }

    @Test
    public void testBuildBuilding2TerritoryScore() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        GameSessionData.updateScores();
        assertEquals(19, GameSessionData.getPlayerScore(1));
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        buildingInfo = StaticDataCache.getBuildingInfos().get(1);
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        GameSessionData.updateScores();
        assertEquals(21, GameSessionData.getPlayerScore(1));
    }

    @Test
    public void testBuildBuilding2TerritoryGetCurrentPlayerResourceQuantity() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        buildingInfo = StaticDataCache.getBuildingInfos().get(1);
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(800, GameSessionData.getCurrentPlayerResourceQuantity("Złoto"));
        assertEquals(600, GameSessionData.getCurrentPlayerResourceQuantity("Żelazo"));
        assertEquals(800, GameSessionData.getCurrentPlayerResourceQuantity("Drewno"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Kamień"));
        assertEquals(1000, GameSessionData.getCurrentPlayerResourceQuantity("Jedzenie"));
    }

    @Test
    public void testBuildBuilding2TerritoryGetCurrentPlayerResourcesy() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        buildingInfo = StaticDataCache.getBuildingInfos().get(1);
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(800, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals(600, GameSessionData.getCurrentPlayerResources().get(1).getQuantity());
        assertEquals(800, GameSessionData.getCurrentPlayerResources().get(2).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(3).getQuantity());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
    }

    @Test
    public void testBuildBuilding2TerritoryGetAllResourcesOf() {
        BuildingInfo buildingInfo = StaticDataCache.getBuildingInfos().get(0);
        Territory territory = StaticDataCache.getTerritories().get(5);
        Player player = GameSessionData.getPlayers().get(0);
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        buildingInfo = StaticDataCache.getBuildingInfos().get(1);
        TerritoryMenu.buildBuilding(buildingInfo, territory, GameSessionData, player, true);
        assertEquals(800, GameSessionData.getAllResourcesOf(1).get(0).getQuantity());
        assertEquals(600, GameSessionData.getAllResourcesOf(1).get(1).getQuantity());
        assertEquals(800, GameSessionData.getAllResourcesOf(1).get(2).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(3).getQuantity());
        assertEquals(1000, GameSessionData.getAllResourcesOf(1).get(4).getQuantity());
    }
}
