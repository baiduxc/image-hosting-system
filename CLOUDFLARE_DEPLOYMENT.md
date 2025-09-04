# Cloudflare Pages 部署指南

## 📋 部署概述

本项目前端可以部署到 Cloudflare Pages，后端需要部署到支持 Node.js 的服务器（如 Railway、Render、Vercel 等）。

## 🚀 Cloudflare Pages 部署步骤

### 1. 准备工作

确保您的项目已经推送到 GitHub 仓库，并且环境配置文件已经清空后端地址：

**`.env.development`**
```env
# 开发环境配置
VITE_API_BASE_URL=

# 开发环境其他配置
VITE_APP_TITLE=图床管理系统 - 开发环境
VITE_APP_ENV=development
```

**`.env.production`**
```env
# 生产环境配置
VITE_API_BASE_URL=

# 生产环境其他配置
VITE_APP_TITLE=图床管理系统
VITE_APP_ENV=production
```

### 2. 连接 GitHub 仓库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权并选择您的 GitHub 仓库

### 3. 配置构建设置

在 Cloudflare Pages 的构建配置中设置：

**构建配置**
```
Framework preset: Vue
Build command: npm run build
Build output directory: dist
Root directory: image-hosting-system
```

**高级设置**
```
Node.js version: 18
```

### 4. 配置环境变量

在 Cloudflare Pages 项目设置中添加环境变量：

#### 生产环境变量
```
VITE_API_BASE_URL = https://your-backend-domain.com/api
VITE_APP_TITLE = 图床管理系统
VITE_APP_ENV = production
```

#### 预览环境变量（可选）
```
VITE_API_BASE_URL = https://your-staging-backend.com/api
VITE_APP_TITLE = 图床管理系统 - 预览版
VITE_APP_ENV = staging
```

### 5. 自定义域名（可选）

1. 在 Cloudflare Pages 项目中进入 **Custom domains**
2. 点击 **Set up a custom domain**
3. 输入您的域名（如 `img.yourdomain.com`）
4. 按照提示配置 DNS 记录

## 🔧 后端部署建议

### Railway 部署
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login

# 部署后端
cd server
railway deploy
```

### Render 部署
1. 连接 GitHub 仓库
2. 选择 `server` 目录作为根目录
3. 设置构建命令：`npm install`
4. 设置启动命令：`npm start`
5. 配置环境变量

### Vercel 部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署后端
cd server
vercel --prod
```

## 📝 环境变量配置详解

### 前端环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `https://api.yourdomain.com/api` |
| `VITE_APP_TITLE` | 应用标题 | `图床管理系统` |
| `VITE_APP_ENV` | 环境标识 | `production` |

### 后端环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 数据库连接字符串 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key` |
| `PORT` | 服务端口 | `3001` |
| `NODE_ENV` | 运行环境 | `production` |

## 🔒 安全配置

### CORS 配置
确保后端正确配置 CORS，允许您的 Cloudflare Pages 域名访问：

```javascript
// server/index.js
app.use(cors({
  origin: [
    'https://your-pages-domain.pages.dev',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### 环境变量安全
- 不要在代码中硬编码敏感信息
- 使用 Cloudflare Pages 的环境变量功能
- 定期更换 JWT 密钥和数据库密码

## 🚦 部署流程

### 自动部署
1. 推送代码到 GitHub 主分支
2. Cloudflare Pages 自动触发构建
3. 构建完成后自动部署到生产环境

### 手动部署
1. 在 Cloudflare Pages 控制台点击 **Create deployment**
2. 选择分支和提交
3. 等待构建完成

## 📊 监控和调试

### 构建日志
在 Cloudflare Pages 控制台查看构建日志：
1. 进入项目详情页
2. 点击具体的部署记录
3. 查看 **Build log** 和 **Function log**

### 常见问题排查

#### 构建失败
```bash
# 检查 package.json 中的构建脚本
"scripts": {
  "build": "vite build",
  "preview": "vite preview"
}
```

#### API 请求失败
1. 检查 `VITE_API_BASE_URL` 是否正确设置
2. 确认后端服务正常运行
3. 检查 CORS 配置

#### 路由问题
在 Cloudflare Pages 中配置 SPA 路由重定向：

**`public/_redirects`**
```
/*    /index.html   200
```

## 🔄 CI/CD 优化

### GitHub Actions 集成
创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd image-hosting-system
        npm ci
        
    - name: Build
      run: |
        cd image-hosting-system
        npm run build
      env:
        VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        
    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: your-project-name
        directory: image-hosting-system/dist
```

## 📈 性能优化

### 构建优化
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          tdesign: ['tdesign-vue-next']
        }
      }
    }
  }
});
```

### 缓存策略
Cloudflare Pages 自动提供：
- 静态资源缓存
- 全球 CDN 加速
- 自动压缩（Gzip/Brotli）

## 🎯 最佳实践

1. **环境分离**：使用不同的环境变量配置开发、预览和生产环境
2. **版本管理**：使用 Git 标签管理发布版本
3. **监控告警**：配置 Cloudflare Analytics 监控访问情况
4. **安全防护**：启用 Cloudflare 的安全功能（WAF、DDoS 防护）
5. **性能监控**：使用 Web Vitals 监控页面性能

## 📞 技术支持

如果在部署过程中遇到问题：

1. 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
2. 检查构建日志和错误信息
3. 确认环境变量配置正确
4. 验证后端服务可访问性

---

🎉 **部署完成后，您的图床系统就可以通过 Cloudflare Pages 提供的域名或自定义域名访问了！**