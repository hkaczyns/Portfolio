package org.habemusrex.cachedData;

import org.habemusrex.entities.*;
import org.hibernate.Session;

import java.util.List;

public class StaticDataCache {
    private static List<Territory> territories;
    private static List<UnitType> unitTypes;
    private static List<UnitCost> unitCosts;
    private static List<UnitUpkeep> unitUpkeeps;
    private static List<BuildingInfo> buildingInfos;
    private static List<BuildingCost> buildingCosts;
    private static List<Resource> resources;
    private static List<BuildingProduction> buildingProductions;
    private static List<BuildingUpkeep> buildingUpkeeps;

    public static void loadStaticData(Session session) {
        territories = session.createQuery("FROM Territory", Territory.class).list();
        buildingInfos = session.createQuery("FROM BuildingInfo", BuildingInfo.class).list();
        buildingCosts = session.createQuery("FROM BuildingCost", BuildingCost.class).list();
        buildingProductions = session.createQuery("FROM BuildingProduction", BuildingProduction.class).list();
        buildingUpkeeps = session.createQuery("FROM BuildingUpkeep", BuildingUpkeep.class).list();
        resources = session.createQuery("FROM Resource", Resource.class).list();
        unitTypes = session.createQuery("FROM UnitType", UnitType.class).list();
        unitCosts = session.createQuery("FROM UnitCost", UnitCost.class).list();
        unitUpkeeps = session.createQuery("FROM UnitUpkeep", UnitUpkeep.class).list();
    }

    public static List<Territory> getTerritories() {
        return territories;
    }

    public static List<UnitType> getArmyTypes() {
        return unitTypes;
    }

    public static List<BuildingInfo> getBuildingInfos() {
        return buildingInfos;
    }

    public static List<BuildingCost> getBuildingCostsOfBuilding(int buildingId) {
        return buildingCosts.stream().filter(bc -> bc.getBuilding().getBuildingId() == buildingId).toList();
    }

    public static List<Resource> getResources() {
        return resources;
    }

    public static List<UnitType> getUnitTypes() {
        return unitTypes;
    }

    public static List<UnitCost> getUnitCostsOf(int wantedId) {
        return unitCosts.stream().filter(cost -> cost.getUnitType().getUnitId() == wantedId).toList();
    }

    public static List<UnitUpkeep> getUnitUpkeepOf(int wantedId) {
        return unitUpkeeps.stream().filter(upkeep -> upkeep.getUnitType().getUnitId() == wantedId).toList();
    }

    public static List<BuildingProduction> getProductionsForBuilding(int buildingId) {
        return buildingProductions.stream()
                .filter(bp -> bp.getBuilding().getBuildingId() == buildingId)
                .toList();
    }

    public static List<BuildingUpkeep> getUpkeepsForBuilding(int buildingId) {
        return buildingUpkeeps.stream()
                .filter(bu -> bu.getBuilding().getBuildingId() == buildingId)
                .toList();
    }

    public static int getNumberOfUnits(){
        return unitTypes.size();
    }

    public static UnitType getUnitType(int unitId) {
        for(UnitType unitType : unitTypes){
            if(unitType.getUnitId() == unitId){
                return unitType;
            }
        }
        return null;
    }
}
