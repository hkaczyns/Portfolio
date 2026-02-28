package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "building_production")
public class BuildingProduction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "building_production_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "building_id", nullable = false)
    private BuildingInfo building;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false)
    private Integer production;

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public BuildingInfo getBuilding() {
        return building;
    }

    public Resource getResource() {
        return resource;
    }

    public Integer getProduction() {
        return production;
    }
}