@echo off
echo 🚀 图床管理系统部署脚本
echo ==========================

REM 检查是否存在 .env 文件
if not exist .env (
    echo ❌ 未找到 .env 文件，请先创建并配置环境变量
    echo 📝 可以复制 .env.example 并修改配置
    pause
    exit /b 1
)

echo 📦 选择部署方式:
echo 1^) Docker 本地部署
echo 2^) 构建前端静态文件
echo 3^) 构建后端 Docker 镜像
echo 4^) 完整 Docker Compose 部署

set /p choice="请选择 (1-4): "

if "%choice%"=="1" (
    echo 🐳 启动 Docker 本地部署...
    docker-compose up --build -d
    echo ✅ 部署完成！
    echo 🌐 前端地址: http://localhost
    echo 🔌 后端地址: http://localhost:3001
) else if "%choice%"=="2" (
    echo 🏗️  构建前端静态文件...
    npm install
    npm run build
    echo ✅ 前端构建完成！文件在 dist/ 目录
    echo 📁 可以将 dist/ 目录部署到任何静态文件服务器
) else if "%choice%"=="3" (
    echo 🐳 构建后端 Docker 镜像...
    cd server
    docker build -t image-hosting-backend:latest .
    echo ✅ 后端镜像构建完成！
    echo 🏃 运行命令: docker run -d --name backend -p 3001:3001 --env-file ../.env image-hosting-backend:latest
) else if "%choice%"=="4" (
    echo 🐳 完整 Docker Compose 部署...
    docker-compose down
    docker-compose up --build -d
    echo ✅ 完整部署完成！
    echo 🌐 前端地址: http://localhost
    echo 🔌 后端地址: http://localhost:3001
    echo 🗄️  数据库: PostgreSQL ^(localhost:5432^)
) else (
    echo ❌ 无效选择
    pause
    exit /b 1
)

echo.
echo 🎉 部署完成！
echo 📚 更多部署选项请查看 DEPLOYMENT.md
pause
