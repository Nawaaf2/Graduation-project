package com.mufakkira.feature.expense;

import com.mufakkira.feature.auth.User;
import com.mufakkira.feature.auth.UserRepository;
import com.mufakkira.shared.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseRepository expenseRepo;
    private final UserRepository    userRepo;
    private final JwtUtil           jwtUtil;

    private Long uid(String auth) {
        return jwtUtil.getUserIdFromToken(auth.replace("Bearer ", ""));
    }

    @GetMapping
    public List<Expense> getAll(@RequestHeader("Authorization") String auth) {
        return expenseRepo.findByUserIdOrderByCreatedAtDesc(uid(auth));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestHeader("Authorization") String auth,
                                 @Valid @RequestBody ExpenseRequest req) {
        User user = userRepo.findById(uid(auth)).orElseThrow();
        Expense e = new Expense();
        e.setUser(user);
        e.setCategory(req.getCategory());
        e.setAmount(req.getAmount());
        e.setDescription(req.getDescription());
        e.setNotes(req.getNotes());
        e.setDate(req.getDate());
        return ResponseEntity.ok(expenseRepo.save(e));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id,
                                    @Valid @RequestBody ExpenseRequest req) {
        Long userId = uid(auth);
        Expense e = expenseRepo.findById(id)
                .filter(x -> x.getUser().getId().equals(userId)).orElse(null);
        if (e == null) return ResponseEntity.status(403).body(Map.of("error", "غير مصرح"));
        e.setCategory(req.getCategory());
        e.setAmount(req.getAmount());
        e.setDescription(req.getDescription());
        e.setNotes(req.getNotes());
        e.setDate(req.getDate());
        return ResponseEntity.ok(expenseRepo.save(e));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id) {
        expenseRepo.deleteByIdAndUserId(id, uid(auth));
        return ResponseEntity.ok(Map.of("message", "تم الحذف"));
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(@RequestHeader("Authorization") String auth) {
        Long userId = uid(auth);
        return Map.of(
            "total",   expenseRepo.sumByUserId(userId),
            "monthly", expenseRepo.sumThisMonth(userId)
        );
    }

    @Data
    static class ExpenseRequest {
        private String category;
        @NotNull @Positive private BigDecimal amount;
        private String description;
        private String notes;
        private LocalDate date;
    }
}
