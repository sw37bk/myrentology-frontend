# PowerShell script for file upload via WinSCP
$sessionOptions = New-Object WinSCP.SessionOptions -Property @{
    Protocol = [WinSCP.Protocol]::Sftp
    HostName = "server278.hosting.reg.ru"
    UserName = "u3304368"
    Password = "i5xTAR4zFJq23uz9"
}

$session = New-Object WinSCP.Session
try {
    $session.Open($sessionOptions)
    
    # Upload files
    $session.PutFiles("api\auth\login.php", "/domains/myrentology.ru/public_html/api/auth/")
    $session.PutFiles("api\avito-settings.php", "/domains/myrentology.ru/public_html/api/")
    $session.PutFiles(".htaccess", "/domains/myrentology.ru/public_html/")
    
    Write-Host "Files uploaded successfully!"
} finally {
    $session.Dispose()
}