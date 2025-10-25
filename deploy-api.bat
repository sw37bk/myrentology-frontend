@echo off
echo Uploading API files to reg.ru...

REM Создаем папку api на сервере
curl -X MKCOL ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"

REM Загружаем основные API файлы
curl -T "api/auth-login.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-api.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-callback.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-callback.php" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-chats.php" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-config.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-messages.php" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-oauth-start.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-oauth-start.php" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-settings.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-settings.php" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-test-connection.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/avito-token.php" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/db-helper.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/db.json" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
curl -T "api/telegram.js" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"

REM Создаем папку auth
curl -X MKCOL ftp://myrentology.ru/public_html/api/auth/ --user "u2802513:Qwerty123456"
curl -T "api/auth/login.js" ftp://myrentology.ru/public_html/api/auth/ --user "u2802513:Qwerty123456"
curl -T "api/auth/login.php" ftp://myrentology.ru/public_html/api/auth/ --user "u2802513:Qwerty123456"

REM Создаем папку avito-callback
curl -X MKCOL ftp://myrentology.ru/public_html/api/avito-callback/ --user "u2802513:Qwerty123456"
curl -T "api/avito-callback/index.php" ftp://myrentology.ru/public_html/api/avito-callback/ --user "u2802513:Qwerty123456"

echo API files uploaded!
pause