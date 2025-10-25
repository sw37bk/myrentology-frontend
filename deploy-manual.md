# Ручной деплой на reg.ru

## Шаг 1: Сборка проекта
```bash
npm run build
```

## Шаг 2: Загрузка на хостинг
1. Откройте FTP клиент (FileZilla, WinSCP)
2. Подключитесь к хостингу reg.ru:
   - Хост: ftp.myrentology.ru (или IP)
   - Логин: ваш FTP логин
   - Пароль: ваш FTP пароль

## Шаг 3: Загрузка файлов
1. Перейдите в папку `/public_html/` на сервере
2. Загрузите ВСЕ файлы из папки `dist/`:
   - index.html
   - index-*.css
   - index-*.js
   - assets/ (если есть)

## Шаг 4: Проверка
Откройте https://myrentology.ru - сайт должен работать!

## Автоматический деплой через GitHub Actions
Добавьте секреты в GitHub:
- FTP_HOST: ваш FTP хост
- FTP_USERNAME: FTP логин  
- FTP_PASSWORD: FTP пароль

При каждом push в main ветку сайт будет автоматически обновляться.