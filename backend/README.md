# مفكرة المصاريف — Backend Java (Spring Boot)

## المتطلبات
- Java 21+
- Maven 3.8+
- PostgreSQL 14+

## إعداد قاعدة البيانات
```sql
CREATE USER mufakkira_user WITH PASSWORD 'mufakkira_pass_2024';
CREATE DATABASE mufakkira_db OWNER mufakkira_user;
GRANT ALL PRIVILEGES ON DATABASE mufakkira_db TO mufakkira_user;
```

ثم شغّل ملف `schema.sql` لإنشاء الجداول.

## تشغيل المشروع
```bash
mvn clean install
mvn spring-boot:run
```

السيرفر يشتغل على: http://localhost:8080

## API Endpoints

### Auth
| Method | URL | الوصف |
|--------|-----|-------|
| POST | /api/auth/register | إنشاء حساب |
| POST | /api/auth/login | تسجيل دخول |

### Expenses
| Method | URL | الوصف |
|--------|-----|-------|
| GET | /api/expenses | جلب كل المصاريف |
| POST | /api/expenses | إضافة مصروف |
| PUT | /api/expenses/{id} | تعديل |
| DELETE | /api/expenses/{id} | حذف |
| GET | /api/expenses/stats | إحصائيات |

> كل الطلبات (ما عدا Auth) تحتاج Header:
> `Authorization: Bearer <token>`

## هيكل المشروع
```
src/main/java/com/mufakkira/
├── MufakkiraApplication.java  ← نقطة الدخول
├── model/                     ← نماذج قاعدة البيانات
├── repository/                ← استعلامات DB
├── controller/                ← API Endpoints
├── security/                  ← JWT
└── config/                    ← Security & CORS
```
