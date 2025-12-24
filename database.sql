-- 班费管理系统数据库结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS class_fee CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE class_fee;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 支出分类表
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 注册码表
CREATE TABLE registration_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_by INT NULL,
    used_at TIMESTAMP NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 申请表
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    applicant_id INT NOT NULL,
    category_id INT NULL,
    expense_time TIMESTAMP NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    cancellation_reason TEXT NULL,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 凭证图片表
CREATE TABLE proof_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 操作日志表
CREATE TABLE operation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    description TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 收入记录表（用于存储收入的具体信息）
CREATE TABLE income_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL UNIQUE,
    source VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 支出记录表（用于存储支出的具体信息）
CREATE TABLE expense_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL UNIQUE,
    applicant_name VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    expense_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 插入默认管理员用户（密码：admin123）
INSERT INTO users (username, password, real_name, email, role) VALUES 
('admin', '$2a$10$8KxO7OZQqI/HQ1q9j7pQXO5q9j7pQXO5q9j7pQXO5q9j7pQXO5q9', '系统管理员', 'admin@example.com', 'admin');

-- 插入默认支出分类
INSERT INTO categories (name, description, created_by) VALUES 
('文具用品', '打印、文具、档案盒等', 1),
('活动费用', '班级活动、聚会等', 1),
('设备购置', '班级设备、器材等', 1),
('其他支出', '其他未分类支出', 1),
('班费收取', '成员缴纳的班费', 1),
('活动经费', '活动赞助、经费等', 1);

-- 创建索引以提高查询性能
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(type);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_operation_logs_user ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at);
CREATE INDEX idx_registration_codes_code ON registration_codes(code);
CREATE INDEX idx_proof_images_application ON proof_images(application_id);