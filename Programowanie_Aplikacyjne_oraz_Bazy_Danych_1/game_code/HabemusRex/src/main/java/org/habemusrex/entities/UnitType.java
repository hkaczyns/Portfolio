package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "unit_types")
public class UnitType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id")
    private Integer unitId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer offensive_strength;

    private Integer defensive_strength;

    private String unit_img;

    // Getters and setters
    public Integer getUnitId() {
        return unitId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Integer getOffensiveStrength() {
        return offensive_strength;
    }

    public Integer getDefensiveStrength() {
        return defensive_strength;
    }

    public String getImage() { return unit_img; }
}
