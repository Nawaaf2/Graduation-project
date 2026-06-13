package com.mufakkira.feature.expense;

import com.mufakkira.feature.auth.User;
import com.mufakkira.feature.auth.UserRepository;
import com.mufakkira.feature.income.IncomeRepository;
import com.mufakkira.shared.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import main.java.com.mufakkira.feature.expense.AutoImportRequest;

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
    private final IncomeRepository  incomeRepo;
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
        Long userId = uid(auth);
        User user = userRepo.findById(userId).orElseThrow();

        // حساب الرصيد الحالي
        BigDecimal totalIncome   = incomeRepo.sumByUserId(userId);
        BigDecimal totalExpenses = expenseRepo.sumByUserId(userId);
        if (totalIncome   == null) totalIncome   = BigDecimal.ZERO;
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

        BigDecimal balance = totalIncome.subtract(totalExpenses);

        // التحقق إن الرصيد يكفي
        if (req.getAmount().compareTo(balance) > 0)
            return ResponseEntity.badRequest().body(Map.of("error", "الرصيد غير كافٍ، رصيدك الحالي " + balance + " ر.س"));

        Expense e = new Expense();
        e.setUser(user);
        e.setCategory(req.getCategory());
        e.setAmount(req.getAmount());
        e.setDescription(req.getDescription());
        e.setNotes(req.getNotes());
        e.setDate(req.getDate());

        BigDecimal newBalance = balance.subtract(req.getAmount());
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("expense", expenseRepo.save(e));
        result.put("balance", newBalance);

        // تنبيه إذا الرصيد أقل من 20%
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            double pct = newBalance.doubleValue() / totalIncome.doubleValue() * 100;
            if (pct < 20) result.put("warning", "تنبيه: رصيدك أقل من 20% من دخلك! تبقى " + newBalance + " ر.س");
        }

        return ResponseEntity.ok(result);
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
    @PostMapping("/auto-import")
public ResponseEntity<?> autoImport(
        @RequestBody AutoImportRequest req,
        @RequestHeader("X-Import-Key") String importKey) {

    // تحقق من المفتاح السري
    String validKey = System.getenv("IMPORT_SECRET_KEY");
    if (validKey == null || !validKey.equals(importKey)) {
        return ResponseEntity.status(401).body(Map.of("error", "مفتاح غير صحيح"));
    }

    // اجيب المستخدم عن طريق الإيميل
    User user = userRepo.findByEmail(req.getEmail()).orElse(null);
    if (user == null) {
        return ResponseEntity.badRequest().body(Map.of("error", "المستخدم غير موجود"));
    }

    Long userId = user.getId();
    BigDecimal amount = BigDecimal.valueOf(req.getAmount());

    // نفس منطق التحقق من الرصيد الموجود
    BigDecimal totalIncome   = incomeRepo.sumByUserId(userId);
    BigDecimal totalExpenses = expenseRepo.sumByUserId(userId);
    if (totalIncome   == null) totalIncome   = BigDecimal.ZERO;
    if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;

    BigDecimal balance = totalIncome.subtract(totalExpenses);

    if (amount.compareTo(balance) > 0) {
        return ResponseEntity.badRequest().body(
            Map.of("error", "الرصيد غير كافٍ، رصيدك الحالي " + balance + " ر.س"));
    }

    // احفظ المصروف
    Expense e = new Expense();
    e.setUser(user);
    e.setCategory("Apple Pay");
    e.setAmount(amount);
    e.setDescription(req.getMerchant());
    e.setNotes("مستورد تلقائياً من الجوال");
    e.setDate(LocalDate.parse(req.getDate()));

    expenseRepo.save(e);

    return ResponseEntity.ok(Map.of(
        "message", "✅ تم حفظ المصروف تلقائياً",
        "amount", amount,
        "merchant", req.getMerchant()
    ));
}
}
