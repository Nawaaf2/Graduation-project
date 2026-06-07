package com.mufakkira.shared.config;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public void sendResetEmail(String toEmail, String token) throws MessagingException {
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

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, "مُفكّرة");
        helper.setTo(toEmail);
        helper.setSubject("إعادة تعيين كلمة المرور");
        helper.setText(htmlContent, true);

        mailSender.send(message);

        System.out.println("3. تم الإرسال بنجاح");
        System.out.println("==============================");
    }
}
