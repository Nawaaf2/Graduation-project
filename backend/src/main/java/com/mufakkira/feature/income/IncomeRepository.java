package com.mufakkira.feature.income;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(i.amount),0) FROM Income i WHERE i.user.id=:userId")
    BigDecimal sumByUserId(Long userId);

    @Transactional
    void deleteByIdAndUserId(Long id, Long userId);
}
