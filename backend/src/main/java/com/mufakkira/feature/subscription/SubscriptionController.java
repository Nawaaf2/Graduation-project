package com.mufakkira.feature.subscription;

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
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subRepo;
    private final UserRepository         userRepo;
    private final JwtUtil                jwtUtil;

    private Long uid(String auth) {
        return jwtUtil.getUserIdFromToken(auth.replace("Bearer ", ""));
    }

    @GetMapping
    public List<Subscription> getAll(@RequestHeader("Authorization") String auth) {
        return subRepo.findByUserIdOrderByRenewalAsc(uid(auth));
    }

    @GetMapping("/due-soon")
    public List<Subscription> dueSoon(@RequestHeader("Authorization") String auth) {
        LocalDate today   = LocalDate.now();
        LocalDate in7days = today.plusDays(7);
        return subRepo.findByUserIdOrderByRenewalAsc(uid(auth))
                .stream()
                .filter(s -> s.getRenewal() != null
                        && !s.getRenewal().isBefore(today)
                        && !s.getRenewal().isAfter(in7days))
                .toList();
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestHeader("Authorization") String auth,
                                 @Valid @RequestBody SubRequest req) {
        User user = userRepo.findById(uid(auth)).orElseThrow();
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setName(req.getName());
        sub.setIcon(req.getIcon());
        sub.setAmount(req.getAmount());
        sub.setCycle(req.getCycle());
        sub.setRenewal(req.getRenewal());
        sub.setColor(req.getColor());
        return ResponseEntity.ok(subRepo.save(sub));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id,
                                    @Valid @RequestBody SubRequest req) {
        Long userId = uid(auth);
        Subscription sub = subRepo.findById(id)
                .filter(s -> s.getUser().getId().equals(userId)).orElse(null);
        if (sub == null) return ResponseEntity.status(403).body(Map.of("error", "غير مصرح"));
        sub.setName(req.getName());
        sub.setIcon(req.getIcon());
        sub.setAmount(req.getAmount());
        sub.setCycle(req.getCycle());
        sub.setRenewal(req.getRenewal());
        sub.setColor(req.getColor());
        return ResponseEntity.ok(subRepo.save(sub));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id) {
        subRepo.deleteByIdAndUserId(id, uid(auth));
        return ResponseEntity.ok(Map.of("message", "تم الحذف"));
    }

    @Data
    static class SubRequest {
        @NotBlank private String name;
        private String    icon;
        @NotNull @Positive private BigDecimal amount;
        private String    cycle;
        private LocalDate renewal;
        private String    color;
    }
}
