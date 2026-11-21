CREATE DATABASE IF NOT EXISTS quadrafacil CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS quadrafacil_teste CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'quadrafacil_app'@'localhost' IDENTIFIED BY 'troque_esta_senha';
GRANT ALL PRIVILEGES ON quadrafacil.* TO 'quadrafacil_app'@'localhost';
GRANT ALL PRIVILEGES ON quadrafacil_teste.* TO 'quadrafacil_app'@'localhost';
FLUSH PRIVILEGES;
