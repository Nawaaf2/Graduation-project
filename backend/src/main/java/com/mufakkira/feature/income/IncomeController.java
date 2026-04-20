package com.mufakkira.feature.income;

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
@RequestMapping("/api/income")
@RequiredArgsConstructor
public class IncomeController {

    private final IncomeRepository incomeRepo;
    private final UserRepository   userRepo;
    private final JwtUtil          jwtUtil;

    private Long uid(String auth) {
        return jwtUtil.getUserIdFromToken(auth.replace("Bearer ", ""));
    }

    @GetMapping
    public List<Income> getAll(@RequestHeader("Authorization") String auth) {
        return incomeRepo.findByUserIdOrderByCreatedAtDesc(uid(auth));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestHeader("Authorization") String auth,
                                 @Valid @RequestBody IncomeRequest req) {
        User user = userRepo.findById(uid(auth)).orElseThrow();
        Income income = new Income();
        income.setUser(user);
        income.setSource(req.getSource());
        income.setIcon(req.getIcon());
        income.setAmount(req.getAmount());
        income.setDescription(req.getDescription());
        income.setDate(req.getDate());
        return ResponseEntity.ok(incomeRepo.save(income));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id,
                                    @Valid @RequestBody IncomeRequest req) {
        Long userId = uid(auth);
        Income income = incomeRepo.findById(id)
                .filter(i -> i.getUser().getId().equals(userId)).orElse(null);
        if (income == null) return ResponseEntity.status(403).body(Map.of("error", "غير مصرح"));
        income.setSource(req.getSource());
        income.setIcon(req.getIcon());
        income.setAmount(req.getAmount());
        income.setDescription(req.getDescription());
        income.setDate(req.getDate());
        return ResponseEntity.ok(incomeRepo.save(income));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id) {
        incomeRepo.deleteByIdAndUserId(id, uid(auth));
        return ResponseEntity.ok(Map.of("message", "تم الحذف"));
    }

    @Data
    static class IncomeRequest {
        private String source;
        private String icon;
        @NotNull @Positive private BigDecimal amount;
        private String description;
        private LocalDate date;
    }
}
