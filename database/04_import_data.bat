@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ============================================
echo   TravelTaste - Import du lieu MongoDB
echo ============================================
echo.

where mongosh >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay 'mongosh' trong PATH.
    echo.
    echo Hai cach xu ly:
    echo   1) Cai MongoDB Shell: https://www.mongodb.com/try/download/shell
    echo      Sau do them vao PATH va khoi dong lai terminal.
    echo   2) Import truc tiep bang MongoDB Compass theo file HUONG-DAN-CHAY.md muc 3.1.
    echo.
    pause
    exit /b 1
)

echo [1/2] Tao 7 index cho collection diadiem...
mongosh --quiet "01_indexes.js"
if errorlevel 1 (
    echo [LOI] Tao index that bai.
    pause
    exit /b 1
)

echo.
echo [2/2] Seed du lieu mau...
mongosh --quiet "02_seed_data.js"
if errorlevel 1 (
    echo [LOI] Seed du lieu that bai.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   HOAN TAT!
echo ============================================
echo.
echo Tai khoan demo:
echo   admin  / admin123   (quan tri)
echo   an123  / 123456     (user)
echo   binh123/ 123456     (user)
echo.
echo Tiep theo: chay backend va frontend theo HUONG-DAN-CHAY.md
echo.
pause
