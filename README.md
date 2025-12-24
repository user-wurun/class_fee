# 班费管理系统

一个基于 React + Next.js + MySQL 的现代化班级财务管理平台，支持用户管理、申请审批、分类统计和数据导出等功能。

## 🚀 功能特性

### 核心功能
- ✅ 用户认证系统（注册码注册、JWT登录）
- ✅ 角色权限管理（管理员/普通用户）
- ✅ 申请管理（收支申请、审批流程）
- ✅ 分类管理（支出分类、自定义分类）
- ✅ 图片上传（腾讯云COS存储）
- ✅ 数据统计（收支明细、分类统计）
- ✅ 数据导出（Excel报表、HTML格式）
- ✅ 响应式设计（移动端适配）

### 业务规则
- 🔒 注册码管理（管理员生成、一次性使用）
- 📊 申请限制（普通用户每日最多3个申请）
- ✅ 审批流程（管理员批准/拒绝/撤销申请）
- 📱 权限控制（普通用户只能管理自己的申请）

## 🛠️ 技术栈

### 前端
- **React 18** - 用户界面框架
- **Next.js 14** - 全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **React Hook Form** - 表单处理
- **React Hot Toast** - 通知提示

### 后端
- **Next.js API Routes** - 后端API
- **MySQL** - 数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密

### 第三方服务
- **腾讯云COS** - 图片存储
- **QRCode** - 二维码生成
- **XLSX** - Excel导出

## 📋 环境要求

- Node.js 18+
- MySQL 8.0+
- 腾讯云COS（可选）

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd 班费管理系统
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制 `.env.local` 文件并配置以下环境变量：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=class_finance

# JWT密钥
JWT_SECRET=your_jwt_secret_key_here

# 腾讯云COS配置
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_REGION=your_cos_region
COS_BUCKET=your_cos_bucket

# 系统配置
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. 数据库初始化
```bash
# 创建数据库并导入表结构
mysql -u root -p < database.sql
```

### 5. 启动项目
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📁 项目结构

```
班费管理系统/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── auth/          # 认证相关API
│   │   ├── applications/  # 申请管理API
│   │   ├── admin/         # 管理员API
│   │   ├── export/        # 导出功能API
│   │   └── upload/        # 文件上传API
│   ├── applications/      # 申请页面
│   ├── admin/            # 管理后台
│   ├── login/            # 登录页面
│   ├── register/         # 注册页面
│   ├── layout.tsx        # 全局布局
│   ├── page.tsx          # 首页
│   └── globals.css       # 全局样式
├── components/           # React组件
│   ├── layout/           # 布局组件
│   ├── forms/            # 表单组件
│   ├── modals/           # 模态框组件
│   └── ui/               # UI组件
├── lib/                  # 工具库
│   └── db.ts            # 数据库连接
├── types/               # TypeScript类型定义
├── utils/               # 工具函数
├── public/              # 静态资源
├── database.sql         # 数据库结构
└── package.json         # 项目配置
```

## 👥 用户角色

### 管理员
- 🔧 系统管理：用户管理、分类管理、注册码管理
- 📋 申请管理：查看所有申请、审批申请、修改/删除申请
- 📊 数据统计：查看全局统计数据
- 💰 财务操作：创建收支申请（无需审批）

### 普通用户
- 📝 申请操作：创建、修改、撤销自己的申请
- 📊 数据查看：查看已通过的申请记录
- 🖼️ 图片上传：支持上传凭证图片
- 📈 分类管理：可创建新的支出分类

## 📱 主要功能

### 1. 用户认证
- 注册码注册（管理员提供）
- JWT token认证
- 角色权限控制

### 2. 申请管理
- 收入/支出申请
- 表单验证
- 图片凭证上传
- 审批状态跟踪

### 3. 数据统计
- 实时余额计算
- 收支分类统计
- 交易次数统计

### 4. 数据导出
- Excel格式导出
- HTML报表导出（可转换为图片）
- 包含二维码信息

### 5. 管理后台
- 用户管理
- 分类管理
- 注册码管理
- 申请审批

## 🔧 开发指南

### API接口
所有API接口都需要在请求头中携带JWT token：
```http
Authorization: Bearer <token>
```

### 数据库设计
主要数据表：
- `users` - 用户表
- `applications` - 申请表
- `categories` - 分类表
- `registration_codes` - 注册码表
- `proof_images` - 凭证图片表

### 部署说明
1. 构建项目：`npm run build`
2. 启动生产服务：`npm start`
3. 配置反向代理（Nginx）
4. 配置SSL证书

## 🐛 常见问题

### Q: 注册码如何获取？
A: 需要管理员在管理后台生成注册码。

### Q: 每日申请限制是多少？
A: 普通用户每天最多只能创建3个待审批的申请。

### Q: 如何添加新的支出分类？
A: 在新建申请时可以选择"其他"并输入新的分类名，系统会自动创建。

### Q: 图片上传失败怎么办？
A: 检查腾讯云COS配置是否正确，确保有足够的存储空间。

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📞 联系方式

如有问题，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至：[2398764156@qq.com]

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
