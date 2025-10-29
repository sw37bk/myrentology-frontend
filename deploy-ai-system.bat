@echo off
echo Deploying AI System...

REM Build frontend
echo Building frontend...
call npm run build

REM Create deployment package
echo Creating deployment package...
if exist ai-system-deploy.zip del ai-system-deploy.zip

REM Copy API files
mkdir temp-deploy\api
copy api\setup-ai-system.php temp-deploy\api\
copy api\ai-assistant.php temp-deploy\api\
copy api\booking-conditions.php temp-deploy\api\
copy api\ai-webhook.php temp-deploy\api\
copy api\products.php temp-deploy\api\
copy api\admin-ai-settings.php temp-deploy\api\

REM Copy built frontend
xcopy /E /I dist temp-deploy\

REM Create zip
powershell Compress-Archive -Path temp-deploy\* -DestinationPath ai-system-deploy.zip -Force

REM Cleanup
rmdir /S /Q temp-deploy

echo AI System deployment package created: ai-system-deploy.zip
echo.
echo Upload this file to your server and extract it.
echo Then run: php api/setup-ai-system.php
pause