-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Добавление админа
INSERT INTO users (login, password) VALUES ('sw37@bk.ru', 'Xw6Nfbhz#')
ON DUPLICATE KEY UPDATE password = 'Xw6Nfbhz#';