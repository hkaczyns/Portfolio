import org.habemusrex.cachedData.StaticDataCache;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class StaticDataCacheTest {
    static private StaticDataCache StaticDataCache;
    @BeforeAll
    static void setUp() {
        Configuration configuration = new Configuration();
        configuration.configure("hibernate.cfg.xml");
        try (SessionFactory sessionFactory = configuration.buildSessionFactory(); Session session = sessionFactory.openSession()) {
            StaticDataCache = new StaticDataCache();
            StaticDataCache.loadStaticData(session);
        }
    }

    @Test
    public void testGetTerritories() {
        assertEquals(14, StaticDataCache.getTerritories().size());
        assertEquals("Warszawa", StaticDataCache.getTerritories().get(0).getName());
        assertEquals(1, StaticDataCache.getTerritories().get(0).getTerritoryId());
        assertEquals("PLAINS", StaticDataCache.getTerritories().get(0).getGeography().toString());
        assertEquals("city", StaticDataCache.getTerritories().get(0).getTerritoryType().toString());
        assertEquals(1956, StaticDataCache.getTerritories().get(0).getY());
        assertEquals(2995, StaticDataCache.getTerritories().get(0).getX());
        assertEquals("warsaw.png", StaticDataCache.getTerritories().get(0).getPanelImg());
        assertEquals("Stolica Polski", StaticDataCache.getTerritories().get(0).getDescription());
    }

    @Test
    public void testGetArmyTypes() {
        assertEquals(7, StaticDataCache.getArmyTypes().size());
        assertEquals("Biedna piechota", StaticDataCache.getArmyTypes().get(0).getName());
        assertEquals(5, StaticDataCache.getArmyTypes().get(0).getOffensiveStrength());
        assertEquals(5, StaticDataCache.getArmyTypes().get(0).getDefensiveStrength());
        assertEquals("biedna_piechota.jpg", StaticDataCache.getArmyTypes().get(0).getImage());
        assertEquals(1, StaticDataCache.getArmyTypes().get(0).getUnitId());
        assertEquals("Każdy walczyć może", StaticDataCache.getArmyTypes().get(0).getDescription());
    }

    @Test
    public void testGetBuildingInfos() {
        assertEquals(12, StaticDataCache.getBuildingInfos().size());
        assertEquals("Fortyfikacje", StaticDataCache.getBuildingInfos().get(0).getName());
        assertEquals(1, StaticDataCache.getBuildingInfos().get(0).getBuildingId());
        assertEquals("castle.png", StaticDataCache.getBuildingInfos().get(0).getBuildingImg());
        assertEquals("Zacny szaniec mospanie!", StaticDataCache.getBuildingInfos().get(0).getDescription());
    }

    @Test
    public void testGetBuildingCostsOfBuilding() {
        assertEquals(2, StaticDataCache.getBuildingCostsOfBuilding(1).size());
        assertEquals(200, StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getCost());
        assertEquals("Zacny szaniec mospanie!", StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getBuilding().getDescription());
        assertEquals(1, StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getBuilding().getBuildingId());
        assertEquals("Fortyfikacje", StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getBuilding().getName());
        assertEquals("castle.png", StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getBuilding().getBuildingImg());
        assertEquals(1, StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getResource().getResourceId());
        assertEquals("Złoto", StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getResource().getName());
        assertEquals("gold.png", StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getResource().getResourceImg());
        assertEquals("błyszczy się", StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getResource().getDescription());
        assertEquals(1, StaticDataCache.getBuildingCostsOfBuilding(1).get(0).getId());
    }

    @Test
    public void testGetResources() {
        assertEquals(5, StaticDataCache.getResources().size());
        assertEquals("Złoto", StaticDataCache.getResources().get(0).getName());
        assertEquals(1, StaticDataCache.getResources().get(0).getResourceId());
        assertEquals("gold.png", StaticDataCache.getResources().get(0).getResourceImg());
        assertEquals("błyszczy się", StaticDataCache.getResources().get(0).getDescription());
    }

    @Test
    public void testGetUnitTypes() {
        assertEquals(7, StaticDataCache.getUnitTypes().size());
        assertEquals("Biedna piechota", StaticDataCache.getUnitTypes().get(0).getName());
        assertEquals(5, StaticDataCache.getUnitTypes().get(0).getOffensiveStrength());
        assertEquals(5, StaticDataCache.getUnitTypes().get(0).getDefensiveStrength());
        assertEquals("biedna_piechota.jpg", StaticDataCache.getUnitTypes().get(0).getImage());
        assertEquals(1, StaticDataCache.getUnitTypes().get(0).getUnitId());
        assertEquals("Każdy walczyć może", StaticDataCache.getUnitTypes().get(0).getDescription());
    }

    @Test
    public void testGetUnitCostsOf() {
        assertEquals(1, StaticDataCache.getUnitCostsOf(1).size());
        assertEquals(50, StaticDataCache.getUnitCostsOf(1).get(0).getCost());
        assertEquals(1, StaticDataCache.getUnitCostsOf(1).get(0).getUnitType().getUnitId());
        assertEquals("Biedna piechota", StaticDataCache.getUnitCostsOf(1).get(0).getUnitType().getName());
        assertEquals(5, StaticDataCache.getUnitCostsOf(1).get(0).getUnitType().getOffensiveStrength());
        assertEquals(5, StaticDataCache.getUnitCostsOf(1).get(0).getUnitType().getDefensiveStrength());
        assertEquals("biedna_piechota.jpg", StaticDataCache.getUnitCostsOf(1).get(0).getUnitType().getImage());
        assertEquals("Każdy walczyć może", StaticDataCache.getUnitCostsOf(1).get(0).getUnitType().getDescription());
        assertEquals(1, StaticDataCache.getUnitCostsOf(1).get(0).getId());
        assertEquals("na pustym brzuchu nie ma co", StaticDataCache.getUnitCostsOf(1).get(0).getResource().getDescription());
        assertEquals(5, StaticDataCache.getUnitCostsOf(1).get(0).getResource().getResourceId());
        assertEquals("Jedzenie", StaticDataCache.getUnitCostsOf(1).get(0).getResource().getName());
        assertEquals("food.png", StaticDataCache.getUnitCostsOf(1).get(0).getResource().getResourceImg());
    }

    @Test
    public void testGetUnitUpkeepOf() {
        assertEquals(1, StaticDataCache.getUnitUpkeepOf(1).size());
        assertEquals(5, StaticDataCache.getUnitUpkeepOf(1).get(0).getUpkeep());
        assertEquals(1, StaticDataCache.getUnitUpkeepOf(1).get(0).getUnitType().getUnitId());
        assertEquals("Biedna piechota", StaticDataCache.getUnitUpkeepOf(1).get(0).getUnitType().getName());
        assertEquals(5, StaticDataCache.getUnitUpkeepOf(1).get(0).getUnitType().getOffensiveStrength());
        assertEquals(5, StaticDataCache.getUnitUpkeepOf(1).get(0).getUnitType().getDefensiveStrength());
        assertEquals("biedna_piechota.jpg", StaticDataCache.getUnitUpkeepOf(1).get(0).getUnitType().getImage());
        assertEquals("Każdy walczyć może", StaticDataCache.getUnitUpkeepOf(1).get(0).getUnitType().getDescription());
        assertEquals(1, StaticDataCache.getUnitUpkeepOf(1).get(0).getId());
        assertEquals("na pustym brzuchu nie ma co", StaticDataCache.getUnitUpkeepOf(1).get(0).getResource().getDescription());
        assertEquals(5, StaticDataCache.getUnitUpkeepOf(1).get(0).getResource().getResourceId());
        assertEquals("Jedzenie", StaticDataCache.getUnitUpkeepOf(1).get(0).getResource().getName());
        assertEquals("food.png", StaticDataCache.getUnitUpkeepOf(1).get(0).getResource().getResourceImg());
    }

    @Test
    public void testGetProductionsForBuilding() {
        assertEquals(1, StaticDataCache.getProductionsForBuilding(1).size());
        assertEquals(1, StaticDataCache.getProductionsForBuilding(1).get(0).getBuilding().getBuildingId());
        assertEquals("Fortyfikacje", StaticDataCache.getProductionsForBuilding(1).get(0).getBuilding().getName());
        assertEquals("castle.png", StaticDataCache.getProductionsForBuilding(1).get(0).getBuilding().getBuildingImg());
        assertEquals("Zacny szaniec mospanie!", StaticDataCache.getProductionsForBuilding(1).get(0).getBuilding().getDescription());
        assertEquals(1, StaticDataCache.getProductionsForBuilding(1).get(0).getId());
        assertEquals(4, StaticDataCache.getProductionsForBuilding(1).get(0).getResource().getResourceId());
        assertEquals("Kamień", StaticDataCache.getProductionsForBuilding(1).get(0).getResource().getName());
        assertEquals("stone.png", StaticDataCache.getProductionsForBuilding(1).get(0).getResource().getResourceImg());
        assertEquals("krucho to widzę", StaticDataCache.getProductionsForBuilding(1).get(0).getResource().getDescription());
        assertEquals(30, StaticDataCache.getProductionsForBuilding(1).get(0).getProduction());
    }

    @Test
    public void testGetUpkeepsForBuilding() {
        assertEquals(1, StaticDataCache.getUpkeepsForBuilding(1).size());
        assertEquals("na pustym brzuchu nie ma co", StaticDataCache.getUpkeepsForBuilding(1).get(0).getResource().getDescription());
        assertEquals(5, StaticDataCache.getUpkeepsForBuilding(1).get(0).getResource().getResourceId());
        assertEquals("Jedzenie", StaticDataCache.getUpkeepsForBuilding(1).get(0).getResource().getName());
        assertEquals("food.png", StaticDataCache.getUpkeepsForBuilding(1).get(0).getResource().getResourceImg());
        assertEquals(1, StaticDataCache.getUpkeepsForBuilding(1).get(0).getBuilding().getBuildingId());
        assertEquals("Fortyfikacje", StaticDataCache.getUpkeepsForBuilding(1).get(0).getBuilding().getName());
        assertEquals("castle.png", StaticDataCache.getUpkeepsForBuilding(1).get(0).getBuilding().getBuildingImg());
        assertEquals("Zacny szaniec mospanie!", StaticDataCache.getUpkeepsForBuilding(1).get(0).getBuilding().getDescription());
        assertEquals(1, StaticDataCache.getUpkeepsForBuilding(1).get(0).getId());
        assertEquals(20, StaticDataCache.getUpkeepsForBuilding(1).get(0).getUpkeep());
    }

    @Test
    public void testGetNumberOfUnits() {
        assertEquals(7, StaticDataCache.getNumberOfUnits());
    }

    @Test
    public void testGetUnitType() {
        assertEquals("Biedna piechota", StaticDataCache.getUnitType(1).getName());
        assertEquals(5, StaticDataCache.getUnitType(1).getOffensiveStrength());
        assertEquals(5, StaticDataCache.getUnitType(1).getDefensiveStrength());
        assertEquals("biedna_piechota.jpg", StaticDataCache.getUnitType(1).getImage());
        assertEquals(1, StaticDataCache.getUnitType(1).getUnitId());
        assertEquals("Każdy walczyć może", StaticDataCache.getUnitType(1).getDescription());
    }
}
