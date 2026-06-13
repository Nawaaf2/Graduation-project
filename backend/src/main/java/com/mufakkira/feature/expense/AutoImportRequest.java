package main.java.com.mufakkira.feature.expense;
import lombok.Data;

@Data
public class AutoImportRequest {
    private String email;      // إيميل حسابك في مفكرة
    private double amount;
    private String merchant;   // اسم التاجر
    private String date;       // "2025-06-13"
}