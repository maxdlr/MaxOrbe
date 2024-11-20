@echo off
echo Running Adobe Creative Cloud Set-Up...

REM Get the current directory of the batch file
set "currentDir=%~dp0"

REM Execute the installer
start "" "%currentDir%Creative_Cloud_Set-Up.exe"
start "" "%currentDir%aescripts.exe"

echo Installation process started. Please follow the on-screen instructions.
pause
