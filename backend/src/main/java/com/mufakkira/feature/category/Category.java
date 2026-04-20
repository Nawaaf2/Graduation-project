package com.mufakkira.feature.category;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mufakkira.feature.auth.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data @NoArgsConstructor @AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 10)
    private String icon;

    @Column(length = 20)
    private String color;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
