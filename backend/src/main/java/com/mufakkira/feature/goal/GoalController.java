package com.mufakkira.feature.goal;

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
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalRepository goalRepo;
    private final UserRepository userRepo;
    private final JwtUtil        jwtUtil;

    private Long uid(String auth) {
        return jwtUtil.getUserIdFromToken(auth.replace("Bearer ", ""));
    }

    @GetMapping
    public List<Goal> getAll(@RequestHeader("Authorization") String auth) {
        return goalRepo.findByUserIdOrderByCreatedAtDesc(uid(auth));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestHeader("Authorization") String auth,
                                 @Valid @RequestBody GoalRequest req) {
        User user = userRepo.findById(uid(auth)).orElseThrow();
        Goal goal = new Goal();
        goal.setUser(user);
        goal.setName(req.getName());
        goal.setIcon(req.getIcon());
        goal.setTarget(req.getTarget());
        goal.setCurrent(req.getCurrent() != null ? req.getCurrent() : BigDecimal.ZERO);
        goal.setColor(req.getColor());
        goal.setTargetDate(req.getTargetDate());
        return ResponseEntity.ok(goalRepo.save(goal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id,
                                    @Valid @RequestBody GoalRequest req) {
        Long userId = uid(auth);
        Goal goal = goalRepo.findById(id)
                .filter(g -> g.getUser().getId().equals(userId)).orElse(null);
        if (goal == null) return ResponseEntity.status(403).body(Map.of("error", "غير مصرح"));
        goal.setName(req.getName());
        goal.setIcon(req.getIcon());
        goal.setTarget(req.getTarget());
        goal.setCurrent(req.getCurrent());
        goal.setColor(req.getColor());
        goal.setTargetDate(req.getTargetDate());
        return ResponseEntity.ok(goalRepo.save(goal));
    }

    @PatchMapping("/{id}/deposit")
    public ResponseEntity<?> deposit(@RequestHeader("Authorization") String auth,
                                     @PathVariable Long id,
                                     @RequestBody Map<String, BigDecimal> body) {
        Long userId = uid(auth);
        BigDecimal amount = body.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
            return ResponseEntity.badRequest().body(Map.of("error", "مبلغ غير صحيح"));
        Goal goal = goalRepo.findById(id)
                .filter(g -> g.getUser().getId().equals(userId)).orElse(null);
        if (goal == null) return ResponseEntity.status(403).body(Map.of("error", "غير مصرح"));
        goal.setCurrent(goal.getCurrent().add(amount).min(goal.getTarget()));
        return ResponseEntity.ok(goalRepo.save(goal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id) {
        goalRepo.deleteByIdAndUserId(id, uid(auth));
        return ResponseEntity.ok(Map.of("message", "تم الحذف"));
    }

    @Data
    static class GoalRequest {
        @NotBlank private String name;
        private String     icon;
        @NotNull @Positive private BigDecimal target;
        private BigDecimal current;
        private String     color;
        private LocalDate  targetDate;
    }
}
