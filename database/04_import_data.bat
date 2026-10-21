@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo ============================================
echo   TravelTaste - Import du lieu MongoDB
echo   (chay bang Node.js, KHONG can mongosh)
echo ============================================
echo.

REM --- Kiem tra node ---
where node >nul 2>nul
if errorlevel 1 (
    echo [LOI] Khong tim thay Node.js.
    echo   Hay cai Node.js 18+ tai https://nodejs.org/ roi chay lai script nay.
    echo.
    pause
    exit /b 1
)

REM --- Cai dat dependencies lan dau ---
if not exist "node_modules\mongodb" (
    echo [1/4] Cai dat dependencies (mongodb, bcryptjs)...
    call npm install --silent
    if errorlevel 1 (
        echo [LOI] npm install that bai. Kiem tra ket noi internet.
        pause
        exit /b 1
    )
) else (
    echo [1/4] Dependencies da co san, bo qua.
)

echo.
echo [2/4] Tao index + seed du lieu mau...
node seed_db.mjs
if errorlevel 1 (
    echo.
    echo [LOI] Seed du lieu that bai.
    pause
    exit /b 1
)

echo.
echo [3/4] Dong bo collections danhgia, binhluan, hinhanh...
node sync_collections.mjs
if errorlevel 1 (
    echo.
    echo [LOI] Dong bo collections that bai.
    pause
    exit /b 1
)

echo.
echo [4/4] Kiem tra du lieu...
node verify_db.mjs
if errorlevel 1 (
    echo.
    echo [LOI] Kiem tra du lieu that bai.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   HOAN TAT! Du lieu da san sang.
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
