@echo off
echo 🗄️ 初始化班费管理系统数据库...
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 检测通过
echo.

echo 📋 执行数据库初始化脚本...
node scripts/init-db.js

if errorlevel 1 (
    echo.
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
) else (
    echo.
    echo 🎉 数据库初始化成功！
    echo.
    echo 📝 默认管理员账户：
    echo    用户名: admin
    echo    密码: admin123
    echo.
    echo 🚀 现在可以启动开发服务器：
    echo    npm run dev
    echo.
    pause
)