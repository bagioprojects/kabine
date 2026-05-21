@echo off
title Politika ve Ekonomi Simulasyonu - Geliştirici Sunucuları Başlatıcı
chcp 65001 > nul

echo ====================================================================
echo   POLİTİKA VE EKONOMİ SİMÜLASYONU GELİŞTİRİCİ SUNUCULARI BAŞLATICI
echo ====================================================================
echo.

echo [1/4] Eski ve askıda kalmış Node.js / Vite süreçleri temizleniyor...
taskkill /f /im node.exe >nul 2>&1
echo Ekranlar ve servisler başarıyla sıfırlandı.
echo.

echo [2/4] Backend API Servisi başlatılıyor (Port 3000)...
start "Backend API Servisi" /D "%~dp0services\core-api" cmd /c "npm run dev"
timeout /t 3 /nobreak >nul

echo [3/4] Vatandaş Oyunu Arayüzü başlatılıyor (Port 5173)...
start "Vatandaş Oyunu (Port 5173)" /D "%~dp0apps\web-user" cmd /c "npm run dev"
timeout /t 2 /nobreak >nul

echo [4/4] Yönetici (Admin) Paneli başlatılıyor (Port 5174)...
start "Yönetici Paneli (Port 5174)" /D "%~dp0apps\web-admin" cmd /c "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ====================================================================
echo   TÜM SERVİSLER BAŞARIYLA BAŞLATILDI!
echo.
echo   - Vatandaş Oyunu: http://localhost:5173/
echo   - Yönetici Paneli: http://localhost:5174/websc-admin/
echo   - Backend API: http://localhost:3000/
echo.
echo   Lütfen açılan terminalleri kapatmayın.
echo ====================================================================
pause
