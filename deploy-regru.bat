@echo off
echo Building project...
npm run build

echo Uploading to reg.ru...
rem Замените на ваши FTP данные
ftp -s:ftp-script.txt

echo Deploy completed!