package org.habemusrex.enemyLogic;

import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.entities.*;
import org.habemusrex.ui.ArmyMenu;
import org.habemusrex.ui.TerritoryMenu;

import java.util.List;
import java.util.Objects;
import java.util.Random;

public class EnemyLogic {
    private final GameSessionData gameSessionData;
    private final List<Player> enemies;
    private final ArmyMenu armyMenu;
    private final TerritoryMenu territoryMenu;
    public EnemyLogic(GameSessionData gameSessionData, ArmyMenu armyMenu) {
        this.gameSessionData = gameSessionData;
        this.enemies = gameSessionData.getEnemies();
        this.armyMenu = armyMenu;
        this.territoryMenu = new TerritoryMenu();
    }
    public void enemyRecruitUnitPhase(){
        Random random = new Random();
        for (Player player : enemies) {
            int unitChoice = random.nextInt(StaticDataCache.getNumberOfUnits()) + 1;
            List<UnitCost> costs = StaticDataCache.getUnitCostsOf(unitChoice);
            boolean canRecruit = true;
            int recruitmentLimit = 0;
            double affordableFactor = 0;
            for (UnitCost cost: costs) {
                if (affordableFactor == 0) {
                    affordableFactor = (double) gameSessionData.getResourcesOf(player.getPlayerId(), cost.getResource().getResourceId()) /(5*cost.getCost());
                }
                else {
                    affordableFactor = (((double) gameSessionData.getResourcesOf(player.getPlayerId(), cost.getResource().getResourceId()) /(5*cost.getCost()))+affordableFactor)/2;
                }
                if (recruitmentLimit == 0) {
                    recruitmentLimit = gameSessionData.getResourcesOf(player.getPlayerId(), cost.getResource().getResourceId()) /cost.getCost();
                }
                else {
                    if (recruitmentLimit > gameSessionData.getResourcesOf(player.getPlayerId(), cost.getResource().getResourceId()) /cost.getCost()) {
                        recruitmentLimit = gameSessionData.getResourcesOf(player.getPlayerId(), cost.getResource().getResourceId()) /cost.getCost();
                    }
                }
                if (gameSessionData.getResourcesOf(player.getPlayerId(), cost.getResource().getResourceId()) < cost.getCost()) {
                    canRecruit = false;
                }
            }
            recruitmentLimit = recruitmentLimit/2;
            if (canRecruit) {
                double number = random.nextDouble();
                while(affordableFactor > number && recruitmentLimit > 0) {
                    this.armyMenu.recruit(StaticDataCache.getUnitType(unitChoice), gameSessionData, player, false);
                    affordableFactor = affordableFactor-0.2;
                    recruitmentLimit--;
                    System.out.println("Enemy recruited " + Objects.requireNonNull(StaticDataCache.getUnitType(unitChoice)).getName() + " for " + player.getFraction().getName());
                }
            }
        }
    }

    public void enemyBuildPhase(){
        Random random = new Random();
        for (Player player : enemies) {
            List<Territory> playerTerritories = gameSessionData.getTerritoriesOf(player.getPlayerId());
            int territoryChoice = random.nextInt(playerTerritories.size());
            Territory territory = playerTerritories.get(territoryChoice);
            List<BuildingInfo> buildingInfos = StaticDataCache.getBuildingInfos();
            int buildingChoice = random.nextInt(buildingInfos.size());
            BuildingInfo buildingInfo = buildingInfos.get(buildingChoice);
            List<Construction> constructionsInTerritory = gameSessionData.getConstructionsForTerritory(territory);
            boolean isConstructed = constructionsInTerritory.stream()
                    .anyMatch(construction -> construction.getBuilding().getBuildingId().equals(buildingInfo.getBuildingId()));
            List<BuildingCost>costs = StaticDataCache.getBuildingCostsOfBuilding(buildingInfo.getBuildingId());
            boolean canBuild = true;
            for (BuildingCost cost: costs) {
                if (gameSessionData.getResourcesOf(player.getPlayerId(), cost.getResource().getResourceId()) < cost.getCost()) {
                    canBuild = false;
                }
            }
            if (canBuild && !isConstructed) {
                double ranVal = random.nextDouble();
                if(ranVal < 0.75) {
                    territoryMenu.buildBuilding(buildingInfo, territory, gameSessionData, player, false);
                    System.out.println("Enemy built " + buildingInfo.getName() + " in " + territory.getName());
                }
            }
        }
    }
}
