package com.mufakkira.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${mailersend.api.key}")
    private String apiKey;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public void sendResetEmail(String toEmail, String token) throws Exception {
        System.out.println("====== فحص عملية الإرسال ======");
        System.out.println("1. إيميل المرسل: " + fromEmail);
        System.out.println("2. إيميل المستقبل: " + toEmail);

        String link = "https://graduation-project-1-z2vw.onrender.com/new-password.html?token=" + token;

        String htmlContent =
            "<div dir='rtl' style='font-family:Arial;'>" +
            "<h2>إعادة تعيين كلمة المرور</h2>" +
            "<p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>" +
            "<a href='" + link + "' style='background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;'>إعادة تعيين كلمة المرور</a>" +
            "<p style='color:#999;margin-top:16px;'>الرابط صالح لمدة 30 دقيقة فقط.</p>" +
            "</div>";

        String body = "{"
            + "\"from\":{\"email\":\"" + fromEmail + "\",\"name\":\"مُفكّرة\"},"
            + "\"to\":[{\"email\":\"" + toEmail + "\"}],"
            + "\"subject\":\"إعادة تعيين كلمة المرور\","
            + "\"html\":\"" + htmlContent.replace("\"", "\\\"") + "\""
            + "}";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.mailersend.com/v1/email"))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("3. Response: " + response.statusCode() + " - " + response.body());

        if (response.statusCode() != 200 && response.statusCode() != 202) {
            throw new RuntimeException("فشل إرسال الإيميل: " + response.body());
        }

        System.out.println("3. تم الإرسال بنجاح");
        System.out.println("==============================");
    }
}