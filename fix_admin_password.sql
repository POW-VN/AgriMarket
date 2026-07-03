-- Fix admin password: admin123 (BCrypt hash) cho PostgreSQL / Supabase
-- Lưu ý: Cột email và password thuộc bảng 'users' (không phải bảng 'admin') do sử dụng chiến lược JPA Joined Inheritance.

UPDATE users 
SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RZVpFWY52xYPjYVm2'
WHERE email = 'admin@agrimarket.com';

-- Kiểm tra lại mật khẩu sau khi đổi
SELECT email, LENGTH(password) as pwd_length, LEFT(password, 10) as pwd_start 
FROM users
WHERE email = 'admin@agrimarket.com';
