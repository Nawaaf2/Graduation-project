package com.mufakkira.feature.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(e.amount),0) FROM Expense e WHERE e.user.id=:userId")
    BigDecimal sumByUserId(Long userId);

    @Query(value = "SELECT COALESCE(SUM(amount),0) FROM expenses WHERE user_id=:userId AND EXTRACT(MONTH FROM date)=EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM date)=EXTRACT(YEAR FROM CURRENT_DATE)", nativeQuery = true)
    BigDecimal sumThisMonth(Long userId);

    @Transactional
    void deleteByIdAndUserId(Long id, Long userId);
}
