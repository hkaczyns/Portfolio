package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "territories")
public class Territory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "territory_id")
    private Integer territoryId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, name="territory_type")
    @Enumerated(EnumType.STRING)
    private TerritoryType territoryType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT", name = "panel_img")
    private String panelImg;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Geography geography;

    private Integer x;
    private Integer y;

    public enum TerritoryType {
        city, countryside
    }

    public enum Geography {
        PLAINS, MOUNTAINS, FOREST, DESERT
    }

    // Getters and setters
    public Integer getTerritoryId() {
        return territoryId;
    }

    public String getPanelImg() {
        return panelImg;
    }

    public void setTerritoryId(Integer territoryId) {
        this.territoryId = territoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TerritoryType getTerritoryType() {
        return territoryType;
    }

    public void setTerritoryType(TerritoryType territoryType) {
        this.territoryType = territoryType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Geography getGeography() {
        return geography;
    }

    public void setGeography(Geography geography) {
        this.geography = geography;
    }

    public Integer getX() {
        return x;
    }

    public void setX(Integer x) {
        this.x = x;
    }

    public Integer getY() {
        return y;
    }

    public void setY(Integer y) {
        this.y = y;
    }
}
