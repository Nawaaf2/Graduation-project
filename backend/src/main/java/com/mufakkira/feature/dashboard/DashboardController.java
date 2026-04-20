package com.mufakkira.feature.dashboard;

import com.mufakkira.feature.expense.ExpenseRepository;
import com.mufakkira.feature.income.IncomeRepository;
import com.mufakkira.feature.goal.GoalRepository;
import com.mufakkira.feature.subscription.SubscriptionRepository;
import com.mufakkira.shared.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ExpenseRepository      expenseRepo;
    private final IncomeRepository       incomeRepo;
    private final GoalRepository         goalRepo;
    private final SubscriptionRepository subRepo;
    private final JwtUtil                jwtUtil;

    @GetMapping
    public Map<String, Object> summary(@RequestHeader("Authorization") String auth) {
        Long userId = jwtUtil.getUserIdFromToken(auth.replace("Bearer ", ""));

        BigDecimal totalIncome   = incomeRepo.sumByUserId(userId);
        BigDecimal totalExpenses = expenseRepo.sumByUserId(userId);
        BigDecimal monthly       = expenseRepo.sumThisMonth(userId);
        BigDecimal balance       = totalIncome.subtract(totalExpenses);

        LocalDate today   = LocalDate.now();
        LocalDate in7days = today.plusDays(7);
        long dueSoon = subRepo.findByUserIdOrderByRenewalAsc(userId)
                .stream()
                .filter(s -> s.getRenewal() != null
                        && !s.getRenewal().isBefore(today)
                        && !s.getRenewal().isAfter(in7days))
                .count();

        List<Map<String, Object>> recent = new ArrayList<>();
        expenseRepo.findByUserIdOrderByCreatedAtDesc(userId).stream().limit(5)
                .forEach(e -> recent.add(Map.of(
                        "type",        "expense",
                        "amount",      e.getAmount(),
                        "description", e.getDescription() != null ? e.getDescription() : "",
                        "category",    e.getCategory()    != null ? e.getCategory()    : "",
                        "date",        e.getDate()        != null ? e.getDate().toString() : "")));
        incomeRepo.findByUserIdOrderByCreatedAtDesc(userId).stream().limit(5)
                .forEach(i -> recent.add(Map.of(
                        "type",   "income",
                        "amount", i.getAmount(),
                        "source", i.getSource() != null ? i.getSource() : "",
                        "icon",   i.getIcon()   != null ? i.getIcon()   : "💰",
                        "date",   i.getDate()   != null ? i.getDate().toString() : "")));

        recent.sort((a, b) -> b.get("date").toString().compareTo(a.get("date").toString()));

        return Map.of(
                "totalIncome",   totalIncome,
                "totalExpenses", totalExpenses,
                "balance",       balance,
                "monthly",       monthly,
                "dueSoon",       dueSoon,
                "goals",         goalRepo.findByUserIdOrderByCreatedAtDesc(userId).stream().limit(3).toList(),
                "recent",        recent.stream().limit(8).toList()
        );
    }
}
