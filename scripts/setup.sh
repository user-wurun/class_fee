#!/bin/bash

echo "🚀 班费管理系统 - 安装脚本"
echo "================================"

# 检查Node.js版本
echo "📋 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低，需要 18+，当前版本: $(node -v)"
    exit 1
fi

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL 未安装，请确保 MySQL 8.0+ 已安装并运行"
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装依赖包..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "⚙️  创建环境变量文件..."
    cp .env.example .env.local 2>/dev/null || cat > .env.local << EOF
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=class_finance

# JWT密钥
JWT_SECRET=your_jwt_secret_key_change_this_in_production

# 腾讯云COS配置
COS_SECRET_ID=
COS_SECRET_KEY=
COS_REGION=
COS_BUCKET=

# 系统配置
NEXTAUTH_SECRET=your_nextauth_secret_change_this_in_production
NEXTAUTH_URL=http://localhost:3000
EOF
    echo "✅ 已创建 .env.local 文件，请根据实际情况修改配置"
else
    echo "✅ 环境变量文件已存在"
fi

# 创建数据库
echo "🗄️  设置数据库..."
read -p "请输入MySQL root密码（直接回车跳过）: " mysql_password

if [ -n "$mysql_password" ]; then
    mysql -u root -p"$mysql_password" -e "CREATE DATABASE IF NOT EXISTS class_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ 数据库创建成功"
        mysql -u root -p"$mysql_password" class_finance < database.sql 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✅ 数据库表结构导入成功"
        else
            echo "⚠️  数据库表结构导入失败，请手动执行: mysql -u root -p class_finance < database.sql"
        fi
    else
        echo "⚠️  数据库连接失败，请手动创建数据库和导入表结构"
    fi
else
    echo "⚠️  跳过数据库设置，请手动执行:"
    echo "   mysql -u root -p"
    echo "   CREATE DATABASE class_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "   USE class_finance;"
    echo "   SOURCE database.sql;"
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "📝 下一步操作:"
echo "1. 修改 .env.local 文件中的配置"
echo "2. 确保数据库连接正常"
echo "3. 运行开发服务器: npm run dev"
echo "4. 访问 http://localhost:3000"
echo ""
echo "📖 更多信息请查看 README.md"