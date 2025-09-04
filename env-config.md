# 🔧 前端环境变量配置指南

## 📝 配置文件

前端项目需要创建以下环境变量文件：

### 1. 开发环境配置
**文件名**: `.env.development`
```env
# 开发环境配置
VITE_API_BASE_URL=http://localhost:3001/api
```

### 2. 生产环境配置
**文件名**: `.env.production`
```env
# 生产环境配置
# 请修改为你的实际后端API地址
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

### 3. 通用配置模板
**文件名**: `.env.example`
```env
# 前端环境变量配置示例
# 复制此文件为 .env.development 或 .env.production 并修改配置

# 后端API基础URL
VITE_API_BASE_URL=http://localhost:3001/api

# 开发环境示例
# VITE_API_BASE_URL=http://localhost:3001/api

# 生产环境示例  
# VITE_API_BASE_URL=https://your-backend-domain.zeabur.app/api
# VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
# VITE_API_BASE_URL=https://your-backend-domain.render.com/api
```

## 🚀 快速创建命令

### Windows (PowerShell)
```powershell
# 创建开发环境配置
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env.development

# 创建生产环境配置
echo "VITE_API_BASE_URL=https://your-backend-domain.com/api" > .env.production

# 创建配置示例文件
@"
# 前端环境变量配置示例
VITE_API_BASE_URL=http://localhost:3001/api
"@ > .env.example
```

### Linux/Mac
```bash
# 创建开发环境配置
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env.development

# 创建生产环境配置
echo "VITE_API_BASE_URL=https://your-backend-domain.com/api" > .env.production

# 创建配置示例文件
cat > .env.example << 'EOF'
# 前端环境变量配置示例
VITE_API_BASE_URL=http://localhost:3001/api
EOF
```

## 📋 不同部署平台的配置

### Cloudflare Pages
在 Cloudflare Pages 控制台的环境变量设置中添加：
- **变量名**: `VITE_API_BASE_URL`
- **变量值**: `https://your-backend-domain.zeabur.app/api`

### Vercel
在 Vercel 项目设置的环境变量中添加：
- **Name**: `VITE_API_BASE_URL`
- **Value**: `https://your-backend-domain.zeabur.app/api`

### Netlify
在 Netlify 站点设置的环境变量中添加：
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://your-backend-domain.zeabur.app/api`

## ⚠️ 重要说明

1. **文件位置**: 环境变量文件必须放在项目根目录（与 `package.json` 同级）
2. **文件名规则**: 
   - `.env.development` - 开发环境（`npm run dev`）
   - `.env.production` - 生产环境（`npm run build`）
   - `.env.local` - 本地覆盖配置（优先级最高）
3. **变量前缀**: 所有前端环境变量必须以 `VITE_` 开头
4. **安全性**: 前端环境变量会被打包到客户端代码中，不要存放敏感信息

## 🔍 验证配置

创建配置文件后，可以在代码中验证：
```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
```

## 📞 常见问题

**Q: 为什么我的环境变量没有生效？**
A: 检查以下几点：
1. 文件名是否正确（`.env.development` 或 `.env.production`）
2. 变量名是否以 `VITE_` 开头
3. 文件是否在项目根目录
4. 重启开发服务器 (`npm run dev`)

**Q: 生产环境如何配置？**
A: 有两种方式：
1. 创建 `.env.production` 文件
2. 在部署平台的控制台中设置环境变量（推荐）
