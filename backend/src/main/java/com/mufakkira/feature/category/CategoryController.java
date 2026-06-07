package com.mufakkira.feature.category;

import com.mufakkira.feature.auth.User;
import com.mufakkira.feature.auth.UserRepository;
import com.mufakkira.shared.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository catRepo;
    private final UserRepository     userRepo;
    private final JwtUtil            jwtUtil;

    private Long uid(String auth) {
        return jwtUtil.getUserIdFromToken(auth.replace("Bearer ", ""));
    }

    @GetMapping
    public List<Category> getAll(@RequestHeader("Authorization") String auth) {
        return catRepo.findByUserIdOrderByNameAsc(uid(auth));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestHeader("Authorization") String auth,
                                 @Valid @RequestBody CatRequest req) {
        User user = userRepo.findById(uid(auth)).orElseThrow();
        Category cat = new Category();
        cat.setUser(user);
        cat.setName(req.getName());
        cat.setIcon(req.getIcon());
        cat.setColor(req.getColor());
        return ResponseEntity.ok(catRepo.save(cat));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String auth,
                                    @PathVariable Long id) {
        catRepo.deleteByIdAndUserId(id, uid(auth));
        return ResponseEntity.ok(Map.of("message", "تم الحذف"));
    }

    @Data
    static class CatRequest {
        @NotBlank private String name;
        private String icon;
        private String color;
    }
}
