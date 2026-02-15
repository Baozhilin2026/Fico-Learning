@echo off
echo ========================================
echo    FICO Learning Website Deploy Script
echo ========================================
echo.

REM Build the project
echo [1/4] Building project...
call npm run build
if errorlevel 1 (
    echo [X] Build failed!
    pause
    exit /b 1
)

REM Switch to gh-pages branch
echo [2/4] Switching to gh-pages branch...
git checkout -f gh-pages
if errorlevel 1 (
    echo [X] Git checkout failed!
    pause
    exit /b 1
)

REM Clean and copy dist files
echo [3/4] Copying files...
cd /d "26\FICO模块英文学习网站" || exit /b 1
if exist dist (
    git rm -rf .
    xcopy /e /y /s dist\* .
    cd /d "26\FICO模块英文学习网站"
) else (
    echo [X] dist directory not found!
    pause
    exit /b 1
)

REM Commit and push
echo [4/4] Committing and pushing...
git add .
git commit -m "Deploy to GitHub Pages - %date% %time:~0,4%"
git push origin gh-pages --force
if errorlevel 1 (
    echo [X] Push failed!
    pause
    exit /b 1
)

REM Switch back to main
echo [5/4] Switching back to main branch...
git checkout main

echo.
echo ========================================
echo    Deploy complete!
echo ========================================
echo.
echo    Website URL: https://baozhilin2026.github.io/Fico-Learning/
echo.
pause
