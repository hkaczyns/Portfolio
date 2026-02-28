package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "fraction_starting_territories")
public class FractionStartingTerritory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fraction_starting_territories_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fraction_id", nullable = false)
    private Fraction fraction;

    @ManyToOne
    @JoinColumn(name = "territory_id", nullable = false)
    private Territory territory;

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public Fraction getFraction() {
        return fraction;
    }

    public Territory getTerritory() {
        return territory;
    }
}