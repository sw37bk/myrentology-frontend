@echo off
echo Deploying to reg.ru...

REM Копируем файлы через curl FTP
curl -T "dist/index.html" ftp://myrentology.ru/public_html/ --user "u2802513:Qwerty123456"
curl -T "dist/index-dICqOP0Y.js" ftp://myrentology.ru/public_html/ --user "u2802513:Qwerty123456"
curl -T "dist/index-PjMMM27y.css" ftp://myrentology.ru/public_html/ --user "u2802513:Qwerty123456"
curl -T "dist/.htaccess" ftp://myrentology.ru/public_html/ --user "u2802513:Qwerty123456"
curl -T "dist/vite.svg" ftp://myrentology.ru/public_html/ --user "u2802513:Qwerty123456"

REM Копируем API файлы
for %%f in (api\*.php api\*.js) do (
    curl -T "%%f" ftp://myrentology.ru/public_html/api/ --user "u2802513:Qwerty123456"
)

echo Deploy completed!
pause