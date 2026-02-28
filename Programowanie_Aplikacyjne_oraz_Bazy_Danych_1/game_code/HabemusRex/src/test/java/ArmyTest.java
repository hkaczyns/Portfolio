import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.entities.*;
import org.habemusrex.enemyLogic.BattleLogic;
import org.habemusrex.ui.ArmyMenu;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ArmyTest {
    static private GameSessionData GameSessionData;
    static private ArmyMenu ArmyMenu;
    static private StaticDataCache StaticDataCache;
    static private org.habemusrex.enemyLogic.BattleLogic BattleLogic;
    @BeforeEach
    public void setUp() {
        Configuration configuration = new Configuration();
        configuration.configure("hibernate.cfg.xml");
        try (SessionFactory sessionFactory = configuration.buildSessionFactory(); Session session = sessionFactory.openSession()) {
            GameSessionData sessionData = new GameSessionData();
            ArmyMenu = new ArmyMenu();
            sessionData.loadData(session);
            GameSessionData = sessionData;
            StaticDataCache = new StaticDataCache();
            StaticDataCache.loadStaticData(session);
            BattleLogic = new BattleLogic(sessionData);
        }
    }

    @Test
    public void TestDismiss(){
        assertEquals(3, GameSessionData.getTotalUnitsOf(1));
        ArmyMenu.dismiss(GameSessionData.getArmyOfPlayer(1).get(1).getArmyType(), GameSessionData, 1, false);
        assertEquals(2, GameSessionData.getTotalUnitsOf(1));
    }
    @Test
    public void TestDismissAllUnitsFromType(){
        assertEquals(3, GameSessionData.getTotalUnitsOf(1));
        List<Army> armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(2, armyList.size());
        ArmyMenu.dismiss(GameSessionData.getArmyOfPlayer(1).getFirst().getArmyType(), GameSessionData, 1, false);
        armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(1, armyList.size());
        assertEquals(2, GameSessionData.getTotalUnitsOf(1));
    }
    @Test
    public void TestDismissSingleUnitFromType(){
        assertEquals(3, GameSessionData.getTotalUnitsOf(1));
        List<Army> armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(2, armyList.size());
        ArmyMenu.dismiss(GameSessionData.getArmyOfPlayer(1).get(1).getArmyType(), GameSessionData, 1, false);
        armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(2, armyList.size());
        assertEquals(2, GameSessionData.getTotalUnitsOf(1));
    }

    @Test
    public void TestRecruit(){
        assertEquals(3, GameSessionData.getTotalUnitsOf(1));
        ArmyMenu.recruit(GameSessionData.getArmyOfPlayer(1).get(1).getArmyType(), GameSessionData, GameSessionData.getCurrentPlayer(), false);
        assertEquals(4, GameSessionData.getTotalUnitsOf(1));
    }

    @Test
    public void TestRecruitSameType(){
        assertEquals(3, GameSessionData.getTotalUnitsOf(1));
        List<Army> armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(2, armyList.size());
        ArmyMenu.recruit(GameSessionData.getArmyOfPlayer(1).get(1).getArmyType(), GameSessionData, GameSessionData.getCurrentPlayer(), false);
        assertEquals(4, GameSessionData.getTotalUnitsOf(1));
        armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(2, armyList.size());
    }

    @Test
    public void TestRecruitNewGroup(){
        assertEquals(3, GameSessionData.getTotalUnitsOf(1));
        List<Army> armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(2, armyList.size());
        UnitType unit = StaticDataCache.getUnitType(4);
        ArmyMenu.recruit(unit, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        assertEquals(4, GameSessionData.getTotalUnitsOf(1));
        armyList = GameSessionData.getArmyOfPlayer(1);
        assertEquals(3, armyList.size());
    }

    @Test
    public void TestArmyConsumption(){
        assertEquals("Złoto", GameSessionData.getCurrentPlayerResources().get(0).getResource().getName());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals("Jedzenie", GameSessionData.getCurrentPlayerResources().get(4).getResource().getName());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
        ArmyMenu.armyResourceConsume(GameSessionData, GameSessionData.getCurrentPlayer());
        assertEquals("Złoto", GameSessionData.getCurrentPlayerResources().get(0).getResource().getName());
        assertEquals(980, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals("Jedzenie", GameSessionData.getCurrentPlayerResources().get(4).getResource().getName());
        assertEquals(975, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
    }

    @Test
    public void TestArmyConsumptionWithTooHighCost(){
        PlayerResource resource = GameSessionData.getAllResourcesOf(1).get(4);
        resource.setQuantity(20);
        assertEquals("Złoto", GameSessionData.getCurrentPlayerResources().get(0).getResource().getName());
        assertEquals(1000, GameSessionData.getCurrentPlayerResources().get(0).getQuantity());
        assertEquals("Jedzenie", GameSessionData.getCurrentPlayerResources().get(4).getResource().getName());
        assertEquals(20, GameSessionData.getCurrentPlayerResources().get(4).getQuantity());
        ArmyMenu.armyResourceConsume(GameSessionData, GameSessionData.getCurrentPlayer());
        assertEquals(2, GameSessionData.getTotalUnitsOf(1));
    }

    @Test
    public void TestBattleDraw(){
        int status = BattleLogic.executeBattle(GameSessionData.getCurrentPlayer(), 3, GameSessionData.getTerritoriesOf(3).getFirst());
        assertEquals(0, status);
    }


    @Test
    public void TestBattleLoss(){
        UnitType unit = StaticDataCache.getUnitType(6);
        ArmyMenu.recruit(unit, GameSessionData, GameSessionData.getEnemies().get(1), false);
        int status = BattleLogic.executeBattle(GameSessionData.getCurrentPlayer(), 3, GameSessionData.getTerritoriesOf(3).getFirst());
        assertEquals(-1, status);
    }

    @Test
    public void TestBattleWin(){
        UnitType unit = StaticDataCache.getUnitType(6);
        ArmyMenu.recruit(unit, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        ArmyMenu.recruit(unit, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        int status = BattleLogic.executeBattle(GameSessionData.getCurrentPlayer(), 3, GameSessionData.getTerritoriesOf(3).getFirst());
        assertEquals(1, status);
    }

    @Test
    public void TestBattleWinReasignTeritory(){
        UnitType unit = StaticDataCache.getUnitType(6);
        Territory territory = GameSessionData.getTerritoriesOf(3).getFirst();
        assertEquals(3, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
        ArmyMenu.recruit(unit, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        ArmyMenu.recruit(unit, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        int status = BattleLogic.executeBattle(GameSessionData.getCurrentPlayer(), 3, GameSessionData.getTerritoriesOf(3).getFirst());
        assertEquals(1, status);
        assertEquals(1, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
    }

    @Test
    public void TestBattleWinUnitWin(){
        UnitType unit1 = StaticDataCache.getUnitType(6);
        UnitType unit2 = StaticDataCache.getUnitType(1);
        Territory territory = GameSessionData.getTerritoriesOf(3).getFirst();
        assertEquals(3, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
        for(int i = 1; i < 10; i++){
            ArmyMenu.recruit(unit1, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        }
        for(int i = 1; i < 10; i++){
            ArmyMenu.recruit(unit2, GameSessionData, GameSessionData.getEnemies().get(1), false);
        }
        assertEquals(11, GameSessionData.getTotalUnitsOf(3));
        int status = BattleLogic.executeBattle(GameSessionData.getCurrentPlayer(), 3, GameSessionData.getTerritoriesOf(3).getFirst());
        assertEquals(1, status);
        assertEquals(1, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
        assertEquals(1, BattleLogic.getPlayerSoldierLoss());
        assertEquals(5, BattleLogic.getEnemySoldierLoss());
    }

    @Test
    public void TestBattleWinUnitDraw(){
        UnitType unit1 = StaticDataCache.getUnitType(1);
        Territory territory = GameSessionData.getTerritoriesOf(3).getFirst();
        assertEquals(3, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
        for(int i = 1; i < 8; i++){
            ArmyMenu.recruit(unit1, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        }
        for(int i = 1; i < 9; i++){
            ArmyMenu.recruit(unit1, GameSessionData, GameSessionData.getEnemies().get(1), false);
        }
        assertEquals(10, GameSessionData.getTotalUnitsOf(3));
        int status = BattleLogic.executeBattle(GameSessionData.getCurrentPlayer(), 3, GameSessionData.getTerritoriesOf(3).getFirst());
        assertEquals(0, status);
        assertEquals(3, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
        assertEquals(2, BattleLogic.getPlayerSoldierLoss());
        assertEquals(2, BattleLogic.getEnemySoldierLoss());
    }

    @Test
    public void TestBattleWinUnitLoss(){
        UnitType unit1 = StaticDataCache.getUnitType(1);
        UnitType unit2 = StaticDataCache.getUnitType(6);
        Territory territory = GameSessionData.getTerritoriesOf(3).getFirst();
        assertEquals(3, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
        for(int i = 1; i < 8; i++){
            ArmyMenu.recruit(unit1, GameSessionData, GameSessionData.getCurrentPlayer(), false);
        }
        for(int i = 1; i < 9; i++){
            ArmyMenu.recruit(unit2, GameSessionData, GameSessionData.getEnemies().get(1), false);
        }
        assertEquals(10, GameSessionData.getTotalUnitsOf(3));
        int status = BattleLogic.executeBattle(GameSessionData.getCurrentPlayer(), 3, GameSessionData.getTerritoriesOf(3).getFirst());
        assertEquals(-1, status);
        assertEquals(3, GameSessionData.getOwnership(territory.getTerritoryId()).getPlayer().getPlayerId());
        assertEquals(5, BattleLogic.getPlayerSoldierLoss());
        assertEquals(1, BattleLogic.getEnemySoldierLoss());
    }
}
