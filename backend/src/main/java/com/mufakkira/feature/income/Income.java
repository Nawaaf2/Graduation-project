package com.mufakkira.feature.income;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mufakkira.feature.auth.User;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "income")
@Data @NoArgsConstructor @AllArgsConstructor
public class Income {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 80)
    private String source;

    @Column(length = 10)
    private String icon;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(length = 255)
    private String description;

    private LocalDate date;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
