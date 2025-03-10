package org.habemusrex.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "buildings_info")
public class BuildingInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "building_id")
    private Integer buildingId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "building_img", nullable = true)
    private String buildingImg;

    // Getters and setters
    public Integer getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Integer buildingId) {
        this.buildingId = buildingId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBuildingImg() {
        return buildingImg;
    }

    public void setBuildingImg(String buildingImg) {
        this.buildingImg = buildingImg;
    }
}
