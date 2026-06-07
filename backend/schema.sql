-- شغّل هذا الملف في PostgreSQL قبل تشغيل المشروع

CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(80) NOT NULL,
    icon       VARCHAR(10),
    color      VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    VARCHAR(80),
    amount      DECIMAL(12,2) NOT NULL,
    description VARCHAR(255),
    notes       TEXT,
    date        DATE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS income (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source      VARCHAR(80),
    icon        VARCHAR(10),
    amount      DECIMAL(12,2) NOT NULL,
    description VARCHAR(255),
    date        DATE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    icon        VARCHAR(10),
    target      DECIMAL(12,2) NOT NULL,
    current     DECIMAL(12,2) DEFAULT 0,
    color       VARCHAR(20),
    target_date DATE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    icon       VARCHAR(10),
    amount     DECIMAL(12,2) NOT NULL,
    cycle      VARCHAR(20),
    renewal    DATE,
    color      VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    currency   VARCHAR(10) DEFAULT 'ر.س',
    budget     DECIMAL(12,2) DEFAULT 0,
    lang       VARCHAR(5) DEFAULT 'ar',
    updated_at TIMESTAMP DEFAULT NOW()
);

GRANT ALL ON ALL TABLES    IN SCHEMA public TO mufakkira_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO mufakkira_user;
