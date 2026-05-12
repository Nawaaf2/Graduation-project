package com.mufakkira.shared.config;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String apiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;

    public void sendResetEmail(String toEmail, String token) throws Exception {
        // --- أسطر الفحص تبدأ هنا ---
        System.out.println("====== فحص عملية الإرسال ======");
        System.out.println("1. هل قرأ الجهاز المفتاح؟ : " + (apiKey != null && !apiKey.isEmpty() ? "نعم" : "لا (null)"));
        System.out.println("2. إيميل المرسل: " + fromEmail);
        System.out.println("3. إيميل المستقبل: " + toEmail);
        // ---------------------------

        Email from    = new Email(fromEmail, "مُفكّرة");
        Email to      = new Email(toEmail);
        String subject = "إعادة تعيين كلمة المرور";
        String link   = "http://127.0.0.1:5500/frontend/new-password.html?token=" + token;

        Content content = new Content("text/html",
            "<div dir='rtl' style='font-family:Arial;'>" +
            "<h2>إعادة تعيين كلمة المرور</h2>" +
            "<p>اضغط على الرابط أدناه لإعادة تعيين كلمة المرور:</p>" +
            "<a href='" + link + "' style='background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;'>إعادة تعيين كلمة المرور</a>" +
            "<p style='color:#999;margin-top:16px;'>الرابط صالح لمدة 30 دقيقة فقط.</p>" +
            "</div>"
        );

        Mail mail = new Mail(from, subject, to, content);
        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // تنفيذ الإرسال وتخزين النتيجة في response
            Response response = sg.api(request);

            // --- طباعة النتيجة النهائية ---
            System.out.println("4. النتيجة من سيرفر SendGrid: " + response.getStatusCode());
            System.out.println("5. نص الرد: " + response.getBody());
            System.out.println("==============================");

        } catch (Exception ex) {
            System.out.println("خطأ فني في الإرسال: " + ex.getMessage());
            throw ex;
        }
    }
}