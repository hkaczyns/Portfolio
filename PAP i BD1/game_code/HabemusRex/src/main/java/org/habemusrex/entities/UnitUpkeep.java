package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "unit_upkeep")
public class UnitUpkeep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_upkeep_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "unit_id", nullable = false)
    private UnitType unitType;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false)
    private Integer upkeep;

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public UnitType getUnitType() {
        return unitType;
    }

    public Resource getResource() {
        return resource;
    }

    public Integer getUpkeep() {
        return upkeep;
    }
}