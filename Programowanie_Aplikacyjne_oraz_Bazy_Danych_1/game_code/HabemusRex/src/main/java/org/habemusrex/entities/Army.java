package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "armies")
public class Army {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "army_id")
    private Integer armyId;

    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne
    @JoinColumn(name = "unit_type", nullable = false)
    private UnitType unitType;

    @Column(name = "unit_count")
    private Integer unitCount;

    // Getters and setters
    public Integer getArmyId() {
        return armyId;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) { this.session = session;}

    public Player getPlayer() {
        return player;
    }

    public UnitType getArmyType() {
        return unitType;
    }

    public Integer getSize() {
        return unitCount;
    }

    public void setSize(Integer size) {
        this.unitCount = size;
    }

    public void setPlayer(Player player) {this.player = player;}

    public void setArmyType(UnitType type) {
        this.unitType = type;
    }
}
