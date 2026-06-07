package com.mufakkira.feature.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserIdOrderByNameAsc(Long userId);
    @Transactional
    void deleteByIdAndUserId(Long id, Long userId);
}
