package com.mufakkira.feature.goal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mufakkira.feature.auth.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "goals")
@Data @NoArgsConstructor @AllArgsConstructor
public class Goal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 10)
    private String icon;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal target;

    @Column(precision = 12, scale = 2)
    private BigDecimal current = BigDecimal.ZERO;

    @Column(length = 20)
    private String color;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
