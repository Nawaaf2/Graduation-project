package com.mufakkira.feature.auth;

import com.mufakkira.feature.category.Category;
import com.mufakkira.feature.category.CategoryRepository;
import com.mufakkira.shared.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository     userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtUtil            jwtUtil;

    private static final List<Object[]> DEFAULT_CATEGORIES = List.of(
        new Object[]{"طعام",    "🍽️", "#e8634a"},
        new Object[]{"مواصلات", "🚗", "#4a90d9"},
        new Object[]{"تسوق",    "🛍️", "#d94a8c"},
        new Object[]{"فواتير",  "📄", "#e8a94a"},
        new Object[]{"ترفيه",   "🎬", "#9b59b6"},
        new Object[]{"صحة",     "💊", "#2ecc71"},
        new Object[]{"تعليم",   "📚", "#1abc9c"},
        new Object[]{"مطاعم",   "☕", "#f39c12"},
        new Object[]{"رياضة",   "⚽", "#27ae60"},
        new Object[]{"أخرى",    "📌", "#95a5a6"}
    );

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("error", "البريد الإلكتروني مسجل مسبقاً"));

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);

        DEFAULT_CATEGORIES.forEach(cat -> {
            Category c = new Category();
            c.setUser(user);
            c.setName((String) cat[0]);
            c.setIcon((String) cat[1]);
            c.setColor((String) cat[2]);
            categoryRepository.save(c);
        });

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return ResponseEntity.ok(Map.of(
            "token",  token,
            "userId", user.getId(),
            "name",   user.getName(),
            "email",  user.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null)
            return ResponseEntity.status(401).body(Map.of("error", "البريد الإلكتروني غير مسجل"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            return ResponseEntity.status(401).body(Map.of("error", "كلمة المرور غير صحيحة"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return ResponseEntity.ok(Map.of(
            "token",  token,
            "userId", user.getId(),
            "name",   user.getName(),
            "email",  user.getEmail()
        ));
    }

    @Data static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @Size(min = 6) private String password;
    }

    @Data static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String password;
    }
}
