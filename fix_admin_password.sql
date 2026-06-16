-- Fix admin password: admin123 (BCrypt hash)
UPDATE [admin] 
SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8RZVpFWY52xYPjYVm2'
WHERE email = 'admin@agrimarket.com';

SELECT email, LEN(password) as pwd_length, LEFT(password, 10) as pwd_start 
FROM [admin];
