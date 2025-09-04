# CDNN图床管理系统

一个基于 Vue 3 + Node.js 的现代化图床管理系统，支持多云存储、图片转存、权限管理等功能。

后端仓库：https://github.com/baiduxc/image-hosting-server

## ✨ 功能特性

### 🖼️ 图片管理
- **本地上传** - 支持拖拽上传、批量上传
- **网络转存** - 智能识别并转存网络图片，绕过防盗链
- **图片预览** - 高清预览、缩放、下载
- **批量操作** - 批量删除、批量下载
- **智能分类** - 按日期自动分类存储

### ☁️ 多云存储
- **腾讯云 COS** - 完整支持，包含自定义域名
- **阿里云 OSS** - 完整支持，包含自定义域名
- **Amazon S3** - 兼容 AWS S3 协议
- **MinIO** - 私有化部署存储
- **七牛云** - 支持七牛云存储
- **又拍云** - 支持又拍云存储

### 🔐 权限管理
- **用户认证** - JWT Token 认证机制
- **角色权限** - 管理员/普通用户权限分级
- **路由守卫** - 页面访问权限控制
- **API 鉴权** - 接口级别权限验证

### 📊 数据统计
- **存储统计** - 实时存储空间使用情况
- **上传统计** - 上传数量、大小统计
- **用户统计** - 用户活跃度分析

### ⚙️ 系统配置
- **存储配置** - 多存储服务配置管理
- **系统设置** - 网站标题、Logo、描述配置
- **安全设置** - 注册开关、权限控制

## 🛠️ 技术栈

### 前端技术
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **TDesign Vue Next** - 企业级设计语言和组件库
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理库
- **Axios** - HTTP 客户端
- **Tailwind CSS** - 实用优先的 CSS 框架

### 后端技术
- **Node.js** - JavaScript 运行时
- **Express.js** - Web 应用框架
- **PostgreSQL** - 关系型数据库 (Neon)
- **JWT** - JSON Web Token 认证
- **Multer** - 文件上传中间件
- **Sharp** - 图片处理库

### 存储服务
- **腾讯云 COS** - 对象存储服务
- **阿里云 OSS** - 对象存储服务
- **Amazon S3** - 云存储服务
- **MinIO** - 开源对象存储
- **七牛云** - 云存储服务
- **又拍云** - 云存储服务

## 📦 项目结构

```
image-hosting-system/
├── public/                 # 静态资源
├── src/                   # 源代码
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   │   ├── Layout.vue   # 主布局组件
│   │   └── ...
│   ├── composables/      # 组合式函数
│   │   ├── useAuth.ts   # 认证相关
│   │   ├── useSystemConfig.ts # 系统配置
│   │   └── ...
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── services/         # API 服务
│   │   └── api.ts
│   ├── views/            # 页面组件
│   │   ├── Login.vue    # 登录页面
│   │   ├── Upload.vue   # 上传页面
│   │   ├── Manage.vue   # 图片管理
│   │   ├── Stats.vue    # 数据统计
│   │   ├── Settings.vue # 系统设置
│   │   └── Profile.vue  # 个人中心
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
└── tsconfig.json        # TypeScript 配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0
- PostgreSQL 数据库

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

### 环境配置

1. 复制环境配置文件：
```bash
# 前端环境配置
cp .env.example .env
```

2. 配置环境变量：

**前端 `.env`**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 📖 使用指南

### 首次使用

1. **系统初始化**
   - 首次启动会自动创建管理员账户
   - 默认用户名：`admin`
   - 默认密码：`admin123`

2. **存储配置**
   - 登录后进入"系统配置"页面
   - 配置至少一个存储服务
   - 设置默认存储服务

3. **开始使用**
   - 上传图片到"上传图片"页面
   - 在"图片管理"中查看和管理图片
   - 在"数据统计"中查看使用情况

### 图片上传

**本地上传**
1. 进入"上传图片"页面
2. 拖拽图片到上传区域或点击选择文件
3. 选择存储服务（可选，默认使用系统默认存储）
4. 点击上传

**网络转存**
1. 在上传页面切换到"网络转存"标签
2. 输入图片URL（支持批量，一行一个）
3. 系统会自动下载并转存到对象存储
4. 支持绕过防盗链限制

### 存储配置

**添加存储服务**
1. 进入"系统配置" → "存储配置"
2. 点击"添加存储配置"
3. 选择存储类型并填写配置信息
4. 测试连接成功后保存
5. 可设置为默认存储

**支持的存储类型**
- **腾讯云 COS**: 需要 SecretId、SecretKey、存储桶名称、地域
- **阿里云 OSS**: 需要 AccessKeyId、AccessKeySecret、存储桶名称、地域
- **Amazon S3**: 需要 AccessKeyId、SecretAccessKey、存储桶名称、地域
- **MinIO**: 需要 AccessKey、SecretKey、存储桶名称、服务端点
- **七牛云**: 需要 AccessKey、SecretKey、存储桶名称
- **又拍云**: 需要操作员账号、密码、服务名称

## 🔧 开发指南

### 开发环境搭建

```bash
# 克隆项目
git clone <repository-url>
cd image-hosting-system

# 安装依赖
npm install
cd server && npm install

# 启动开发服务
npm run dev        # 前端开发服务
npm run dev:server # 后端开发服务
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化

### 构建部署

```bash
# 构建前端
npm run build

# 构建后端 (如果需要)
cd server
npm run build
```

### API 接口

**认证接口**
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

**图片接口**
- `GET /api/images` - 获取图片列表
- `POST /api/upload` - 上传图片
- `POST /api/transfer` - 网络图片转存
- `DELETE /api/images/:id` - 删除图片

**存储接口**
- `GET /api/storage` - 获取存储配置列表
- `POST /api/storage` - 添加存储配置
- `PUT /api/storage/:id` - 更新存储配置
- `DELETE /api/storage/:id` - 删除存储配置
- `PUT /api/storage/:id/default` - 设置默认存储

**系统配置接口**
- `GET /api/config` - 获取系统配置
- `PUT /api/config` - 更新系统配置
- `GET /api/config/system` - 获取公开系统配置

## 🐛 常见问题

### 图片上传失败
1. 检查存储服务配置是否正确
2. 确认存储服务的访问权限
3. 检查网络连接是否正常
4. 查看浏览器控制台错误信息

### 图片显示异常
1. 确认存储服务的公网访问权限
2. 检查自定义域名配置
3. 确认 CORS 设置正确

### 登录问题
1. 检查用户名和密码是否正确
2. 确认数据库连接正常
3. 检查 JWT 密钥配置

## 📄 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue: [GitHub Issues](https://github.com/your-repo/issues)
- 邮箱: xcljxf@gmial.com

## 🙏 致谢

感谢以下开源项目的支持：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TDesign](https://tdesign.tencent.com/) - 企业级设计语言
- [Express.js](https://expressjs.com/) - Web 应用框架
- [PostgreSQL](https://www.postgresql.org/) - 开源关系型数据库

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！