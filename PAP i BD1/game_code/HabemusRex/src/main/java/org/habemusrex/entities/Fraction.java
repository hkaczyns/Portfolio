package org.habemusrex.entities;

import jakarta.persistence.*;


@Entity
@Table(name = "fractions")
public class Fraction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fraction_id")
    private Integer fractionId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Getters and setters
    public Integer getFractionId() {
        return fractionId;
    }

    public void setFractionId(Integer fractionId) {
        this.fractionId = fractionId;
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
}
