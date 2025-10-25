@echo off
echo Deploying to correct path /www/myrentology.ru/...

REM Загружаем основные файлы сайта
curl -T "dist/index.html" ftp://myrentology.ru/www/myrentology.ru/ --user "u2802513:Qwerty123456"
curl -T "dist/index-dICqOP0Y.js" ftp://myrentology.ru/www/myrentology.ru/ --user "u2802513:Qwerty123456"
curl -T "dist/index-PjMMM27y.css" ftp://myrentology.ru/www/myrentology.ru/ --user "u2802513:Qwerty123456"
curl -T "dist/.htaccess" ftp://myrentology.ru/www/myrentology.ru/ --user "u2802513:Qwerty123456"
curl -T "dist/vite.svg" ftp://myrentology.ru/www/myrentology.ru/ --user "u2802513:Qwerty123456"

REM Создаем папку api и загружаем PHP файл авторизации
curl -X MKCOL ftp://myrentology.ru/www/myrentology.ru/api/ --user "u2802513:Qwerty123456"
curl -T "api/auth-login.php" ftp://myrentology.ru/www/myrentology.ru/api/ --user "u2802513:Qwerty123456"

echo Deploy completed to /www/myrentology.ru/!
pause