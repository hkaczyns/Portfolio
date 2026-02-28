package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "battles")
public class Battle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "battle_id")
    private Integer battleId;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Territory location;

    @ManyToOne
    @JoinColumn(name = "attacker_army_id", nullable = false)
    private Army attackerArmy;

    @ManyToOne
    @JoinColumn(name = "defender_army_id", nullable = false)
    private Army defenderArmy;

    @Enumerated(EnumType.STRING)
    private Outcome outcome;

    public enum Outcome {
        ATTACKER_VICTORY,
        DEFENDER_VICTORY,
        STALEMATE
    }

    // Getters and setters
    public Integer getBattleId() {
        return battleId;
    }

    public void setBattleId(Integer battleId) {
        this.battleId = battleId;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Territory getLocation() {
        return location;
    }

    public void setLocation(Territory location) {
        this.location = location;
    }

    public Army getAttackerArmy() {
        return attackerArmy;
    }

    public void setAttackerArmy(Army attackerArmy) {
        this.attackerArmy = attackerArmy;
    }

    public Army getDefenderArmy() {
        return defenderArmy;
    }

    public void setDefenderArmy(Army defenderArmy) {
        this.defenderArmy = defenderArmy;
    }

    public Outcome getOutcome() {
        return outcome;
    }

    public void setOutcome(Outcome outcome) {
        this.outcome = outcome;
    }
}
