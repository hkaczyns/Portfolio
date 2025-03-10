package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "territory_base_resources")
public class TerritoryBaseResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "territory_base_resources_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "territory_id", nullable = false)
    private Territory territory;

    @ManyToOne
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false)
    private Integer quantity;

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public Territory getTerritory() {
        return territory;
    }

    public Resource getResource() {
        return resource;
    }

    public Integer getQuantity() {
        return quantity;
    }
}