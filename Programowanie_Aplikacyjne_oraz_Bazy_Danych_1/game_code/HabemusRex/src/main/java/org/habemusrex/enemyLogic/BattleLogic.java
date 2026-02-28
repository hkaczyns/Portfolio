package org.habemusrex.enemyLogic;

import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.entities.Army;
import org.habemusrex.entities.Player;
import org.habemusrex.entities.Territory;
import org.habemusrex.ui.ArmyMenu;

import java.util.List;
import java.util.Random;

public class BattleLogic{
    private final GameSessionData gameSessionData;
    private int playerSoldierLoss;
    private int enemySoldierLoss;

    public BattleLogic(GameSessionData gameSessionData) {
        this.gameSessionData = gameSessionData;
    }

    public int executeBattle(Player player, int enemyId, Territory territory) {
        int offensive = gameSessionData.getOffensiveStrengthFor(player.getPlayerId());
        int defensive = gameSessionData.getDefensiveStrengthFor(enemyId);
        int result;
        if(offensive > defensive*1.5){
            result = 1;
            playerSoldierLoss = calculateSoldierLoss(player.getPlayerId(), 0.1);
            enemySoldierLoss = calculateSoldierLoss(enemyId, 0.5);
            gameSessionData.changeOwnership(territory.getTerritoryId(), player);
        }
        else if(offensive < defensive){
            result = -1;
            playerSoldierLoss = calculateSoldierLoss(player.getPlayerId(), 0.5);
            enemySoldierLoss = calculateSoldierLoss(enemyId, 0.1);
        }
        else{
            result = 0;
            playerSoldierLoss = calculateSoldierLoss(player.getPlayerId(), 0.25);
            enemySoldierLoss = calculateSoldierLoss(enemyId, 0.25);
        }

        return result;
    }

    private int calculateSoldierLoss(int playerId, double lossFactor){
        int soldiersLost = (int) (gameSessionData.getTotalUnitsOf(playerId) * lossFactor);
        if (soldiersLost > gameSessionData.getTotalUnitsOf(playerId) - 1){
            soldiersLost = gameSessionData.getTotalUnitsOf(playerId);
        }
        ArmyMenu control = new ArmyMenu();
        Random rand = new Random();
        int kills = soldiersLost;
        while(kills > 0){
            List<Army> army = gameSessionData.getArmyOfPlayer(playerId);
            int index = rand.nextInt(army.size());
            Army killed = army.get(index);
            control.dismiss(killed.getArmyType(), gameSessionData, playerId, false  );
            kills--;
        }
        return soldiersLost;
    }

    public int getPlayerSoldierLoss() {
        return playerSoldierLoss;
    }

    public int getEnemySoldierLoss(){
        return enemySoldierLoss;
    }
}
