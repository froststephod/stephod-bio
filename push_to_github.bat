@echo off
title STEPHOD - GitHub Uploader
cd /d "%~dp0"
echo ========================================================
echo   STEPHOD Bio Link - Uploading full project to GitHub
echo ========================================================
echo.
git init
git config user.name "froststephod"
git config user.email "froststephod@users.noreply.github.com"
git remote remove origin 2>nul
git remote add origin https://github.com/froststephod/stephod-bio.git
git branch -M main
git add .
git commit -m "Upload full project: src, public, data"
echo.
echo --------------------------------------------------------
echo  Pushing code to https://github.com/froststephod/stephod-bio.git
echo  (If asked, please click 'Sign in with your browser')
echo --------------------------------------------------------
echo.
git push -u origin main --force
echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo  SUCCESS! โค้ดทั้งหมดถูกอัปโหลดขึ้น GitHub เรียบร้อยแล้ว!
    echo  กลับไปที่หน้าจอ Vercel แล้วกดปุ่ม Deploy ได้เลยครับ!
    echo ========================================================
) else (
    echo.
    echo Something went wrong. Please check your internet connection or login.
)
echo.
pause
