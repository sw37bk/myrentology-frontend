@echo off
echo Deploying to reg.ru FTP...

:: Build project
call npm run build

:: Upload via curl (if available)
curl -T "dist/index.html" ftp://31.31.197.14/public_html/ --user u3304368:Xw6Nfbhz#
curl -T "api/auth/login.php" ftp://31.31.197.14/public_html/api/auth/ --user u3304368:Xw6Nfbhz#
curl -T "api/avito-settings.php" ftp://31.31.197.14/public_html/api/ --user u3304368:Xw6Nfbhz#

echo Deploy completed!
pause