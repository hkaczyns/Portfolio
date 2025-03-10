package org.habemusrex.cachedData;

import org.habemusrex.entities.*;
import org.hibernate.Session;
import org.hibernate.Transaction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class GameSessionData {
    private List<Army> armies = new ArrayList<>();
    private List<Battle> battles = new ArrayList<>();
    private List<Construction> constructions = new ArrayList<>();
    private List<Player> players = new ArrayList<>();
    private List<PlayerResource> currentPlayerResources = new ArrayList<>();
    private List<TerritoryOwnership> territoryOwnerships = new ArrayList<>();
    private final Map<Integer, Integer> playerScores = new HashMap<>();
    private org.habemusrex.entities.Session currentSession;
    private User currentUser;
    private Player currentPlayer;

    private int currentSessionId;
    private Session session;

    private static final int POINTS_TO_WIN = 22;
    private boolean victoryAnnounced = false;
    private boolean nearVictoryAnnounced = false;


    public void loadData(Session session) {
        this.session = session;
        int userId = 1;

        // Get the first session id of the user
        currentSessionId = session.createQuery("SELECT s.sessionId FROM Session s WHERE s.user.userId = :userId", Integer.class)
                .setParameter("userId", userId)
                .setMaxResults(1)
                .uniqueResult();

        if (currentSessionId == 0) {
            throw new IllegalStateException("No session found for user ID: " + userId);
        }
        currentSession = session.get(org.habemusrex.entities.Session.class, currentSessionId);
        currentUser = session.get(User.class, userId);

        armies = session.createQuery("FROM Army a WHERE a.session.sessionId = :sessionId", Army.class)
                .setParameter("sessionId", currentSessionId)
                .list();

        battles = session.createQuery("FROM Battle b WHERE b.session.sessionId = :sessionId", Battle.class)
                .setParameter("sessionId", currentSessionId)
                .list();
        constructions = session.createQuery("FROM Construction c WHERE c.session.sessionId = :sessionId", Construction.class)
                .setParameter("sessionId", currentSessionId)
                .list();

        territoryOwnerships = session.createQuery("FROM TerritoryOwnership t WHERE t.session.sessionId = :sessionId", TerritoryOwnership.class)
                .setParameter("sessionId", currentSessionId)
                .list();


        players = session.createQuery("FROM Player p WHERE p.session.sessionId = :sessionId", Player.class)
                .setParameter("sessionId", currentSessionId)
                .list();
        currentPlayer = players.stream()
                .filter(p -> p.getType() == Player.PlayerType.USER)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No user player found in the session"));

        // Load all player resources for the session
        currentPlayerResources = session.createQuery("FROM PlayerResource pr WHERE pr.player.session.sessionId = :sessionId", PlayerResource.class)
                .setParameter("sessionId", currentSessionId)
                .list();

    }

    public void saveData() {
        Transaction transaction = session.beginTransaction();
        for (Army army : armies) {
            session.saveOrUpdate(army);
        }
        for (Battle battle : battles) {
            session.saveOrUpdate(battle);
        }
        for (Construction construction : constructions) {
            session.saveOrUpdate(construction);
        }
        for (PlayerResource playerResource : currentPlayerResources) {
            session.saveOrUpdate(playerResource);
        }
        for (TerritoryOwnership territoryOwnership : territoryOwnerships) {
            session.saveOrUpdate(territoryOwnership);
        }
        transaction.commit();
        System.out.println("Game saved successfully!");
    }

    public org.habemusrex.entities.Session getCurrentSession() {
        return currentSession;
    }

    public User getCurrentUser() { return currentUser; }

    public List<Army> getArmies() {
        return armies;
    }

    public List<Battle> getBattles() {
        return battles;
    }

    public List<Construction> getConstructions() { return constructions; }

    public List<Construction> getConstructionsForTerritory(Territory territory) {
        return constructions.stream()
                .filter(c -> c.getTerritory().getTerritoryId().equals(territory.getTerritoryId()))
                .toList();
    }

    public List<PlayerResource> getCurrentPlayerResources() {
        return currentPlayerResources;
    }

    public Integer getCurrentPlayerResourceQuantity(String resourceName) {
        return currentPlayerResources.stream()
                .filter(pr -> pr.getResource().getName().equals(resourceName))
                .map(PlayerResource::getQuantity)
                .findFirst()
                .orElse(0);
    }


    public List<Player> getPlayers() {
        return players;
    }

    public Player getCurrentPlayer() {
        return currentPlayer;
    }

    public void addArmy(Army army) {
        armies.add(army);
    }

    public void addBattle(Battle battle) {
        battles.add(battle);
    }

    public void addConstruction(Construction construction) {
        constructions.add(construction);
    }

    public int getCurrentSessionId() {
        return currentSessionId;
    }

    public List<Army> getArmyOfPlayer(int playerId) {
        return armies.stream().filter(a -> a.getPlayer().getPlayerId() == playerId).collect(Collectors.toList());
    }

    public void addPlayerResource(Player player, Resource resource, int amount) {
        System.out.println("Adding " + amount + " " + resource.getName() + " to player " + player.getPlayerId());
        PlayerResource playerResource = currentPlayerResources.stream()
                .filter(pr -> pr.getPlayer().getPlayerId().equals(player.getPlayerId()) &&
                        pr.getResource().getResourceId().equals(resource.getResourceId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Resource not found for player: " + player.getPlayerId() + " and resource: " + resource.getResourceId()));

        playerResource.setQuantity(playerResource.getQuantity() + amount);
    }

    public void subtractPlayerResource(Player player, Resource resource, int amount) {
        System.out.println("Subtracting " + amount + " " + resource.getName() + " from player " + player.getPlayerId());
        PlayerResource playerResource = currentPlayerResources.stream()
                .filter(pr -> pr.getPlayer().getPlayerId().equals(player.getPlayerId()) &&
                        pr.getResource().getResourceId().equals(resource.getResourceId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Resource not found for player: " + player.getPlayerId() + " and resource: " + resource.getResourceId()));

        playerResource.setQuantity(playerResource.getQuantity() - amount);
    }

    public void deleteArmyEntry(Army army) {
        armies.remove(army);
    }

    public int getMaxArmyId() {
        int maxId = 0;
        for (Army army : armies) {
            if (army.getArmyId() > maxId) {
                maxId = army.getArmyId();
            }
        }
        return maxId;
    }

    public int getUnitCountFor(Player player, int unit_id) {
        int unitCount = 0;
        List<Army> playerArmy;
        playerArmy = getArmyOfPlayer(player.getPlayerId());
        for (Army army : playerArmy) {
            if (army.getArmyType().getUnitId() == unit_id) {
                unitCount = unitCount + army.getSize();
            }
        }
        return unitCount;
    }

    public List<Player> getEnemies() {
        List<Player> enemies = new ArrayList<>(this.players);
        enemies.remove(this.currentPlayer);
        return enemies;
    }

    public int getResourcesOf(int playerId, int resourceId) {
        for (PlayerResource resource : this.currentPlayerResources) {
            if (resource.getPlayer().getPlayerId() == playerId && resource.getResource().getResourceId() == resourceId) {
                return resource.getQuantity();
            }
        }
        return 0;
    }

    public List<PlayerResource> getAllResourcesOf(int playerId) {
        List<PlayerResource> resources = new ArrayList<>();
        for (PlayerResource resource : this.currentPlayerResources) {
            if (resource.getPlayer().getPlayerId() == playerId) {
                resources.add(resource);
            }
        }
        return resources;
    }

    public int getTotalUnitsOf(int playerId) {
        int totalUnits = 0;
        for (Army group : this.armies) {
            if (group.getPlayer().getPlayerId() == playerId) {
                totalUnits += group.getSize();
            }
        }
        return totalUnits;
    }

    public int getOffensiveStrengthFor(int playerId) {
        int offensiveStrength = 0;
        for (Army group : this.armies) {
            if (group.getPlayer().getPlayerId() == playerId) {
                offensiveStrength += group.getArmyType().getOffensiveStrength()*group.getSize();
            }
        }
        return offensiveStrength;
    }


    public int getDefensiveStrengthFor(int playerId) {
        int defensiveStrength = 0;
        for (Army group : this.armies) {
            if (group.getPlayer().getPlayerId() == playerId) {
                defensiveStrength += group.getArmyType().getDefensiveStrength()*group.getSize();
            }
        }
        return defensiveStrength;
    }

    public void changeOwnership(int territoryId, Player newOwner) {
        for (TerritoryOwnership territoryOwnership : territoryOwnerships) {
            if(territoryOwnership.getTerritory().getTerritoryId() == territoryId) {
                territoryOwnership.setPlayer(newOwner);
            }
        }
    }

    public TerritoryOwnership getOwnership(int territoryId) {
        for (TerritoryOwnership territoryOwnership : territoryOwnerships) {
            if(territoryOwnership.getTerritory().getTerritoryId() == territoryId) {
                return territoryOwnership;
            }
        }
        return null;
    }

    public List<Territory> getTerritoriesOf(int playerId) {
        List<Territory> territories = new ArrayList<>();
        for(TerritoryOwnership territoryOwnership : territoryOwnerships) {
            if(territoryOwnership.getPlayer().getPlayerId() == playerId) {
                territories.add(territoryOwnership.getTerritory());
            }
        }
        return territories;
    }

    public void updateScores() {
        // Reset scores
        for (Player player : players) {
            playerScores.put(player.getPlayerId(), 0);
        }

        // Calculate points for territories
        for (TerritoryOwnership ownership : territoryOwnerships) {
            int playerId = ownership.getPlayer().getPlayerId();
            playerScores.merge(playerId, 1, Integer::sum);
        }

        // Calculate points for buildings
        for (Construction construction : constructions) {
            TerritoryOwnership ownership = getOwnership(construction.getTerritory().getTerritoryId());
            int playerId = ownership.getPlayer().getPlayerId();
            playerScores.merge(playerId, 1, Integer::sum);
        }

        for (Player player : players) {
            int score = playerScores.getOrDefault(player.getPlayerId(), 0);
            System.out.println("Player " + player.getPlayerId() +
                    " (Fraction: " + player.getFraction().getName() + "): " + score + " points");
        }
    }

    public int getPlayerScore(int playerId) {
        return playerScores.getOrDefault(playerId, 0);
    }

    public Player checkForWinner() {
        if (victoryAnnounced) {
            return null;
        }

        // Check if any player has won
        for (Player player : players) {
            int score = getPlayerScore(player.getPlayerId());
            if (score >= POINTS_TO_WIN) {
                victoryAnnounced = true;
                return player;
            }
        }
        return null; // No winner yet
    }

    public Player checkForNearVictory() {
        if (victoryAnnounced || nearVictoryAnnounced) {
            return null;
        }

        // Check if any player is one point away from victory
        for (Player player : players) {
            int score = getPlayerScore(player.getPlayerId());
            if (score == POINTS_TO_WIN - 1) {
                nearVictoryAnnounced = true;
                return player;
            }
        }
        return null;
    }
}

