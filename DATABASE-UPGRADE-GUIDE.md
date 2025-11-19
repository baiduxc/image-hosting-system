# 数据库升级指南

本指南说明如何升级图床系统以支持 SQLite 数据库和数据库管理功能。

## 一、概述

本次更新添加了以下功能：

1. ✅ **SQLite 数据库支持** - 无需配置外部数据库，适合个人或小型部署
2. ✅ **数据库备份功能** - 一键备份 SQLite 数据库
3. ✅ **PostgreSQL 转 SQLite** - 将现有 PostgreSQL 数据转换为 SQLite
4. ✅ **数据库适配层** - 自动适配不同数据库类型

## 二、快速开始

### 新用户（推荐使用 SQLite）

1. **安装依赖**
```bash
cd server
npm install
```

2. **配置环境变量**

创建或编辑 `.env` 文件：
```env
# 使用 SQLite
DB_TYPE=sqlite
SQLITE_PATH=./data/database.sqlite

# JWT密钥（必须设置）
JWT_SECRET=your-secret-key-here

# 服务器端口
PORT=3001
```

3. **启动服务**
```bash
npm start
```

系统将自动：
- 创建 `data/database.sqlite` 文件
- 初始化数据库表结构
- 创建默认管理员账户（admin/admin123）

### 现有用户（PostgreSQL 迁移到 SQLite）

#### 方式一：使用管理后台迁移（推荐）

1. 登录管理后台（使用管理员账户）
2. 进入"系统设置" → "数据库管理"
3. 在"数据库迁移"部分输入 PostgreSQL 连接字符串：
   ```
   postgresql://username:password@host:5432/database
   ```
4. 点击"开始转换"
5. 等待转换完成（显示转换详情）
6. 点击"下载 SQLite 数据库文件"
7. 将下载的文件重命名为 `database.sqlite` 并放到 `server/data/` 目录
8. 修改 `.env` 文件：
   ```env
   DB_TYPE=sqlite
   SQLITE_PATH=./data/database.sqlite
   ```
9. 重启服务器

#### 方式二：使用API迁移

```bash
curl -X POST http://localhost:3001/api/database/migrate/pg-to-sqlite \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"databaseUrl":"postgresql://user:pass@localhost:5432/imagedb"}'
```

## 三、文件结构

升级后的文件结构：

```
server/
├── databaseAdapter.js       # 数据库适配层（新增）
├── databaseInit.js          # 数据库初始化（新增）
├── databaseOperations.js    # 数据库操作接口（新增）
├── database.js              # 数据库入口（已更新）
├── data/                    # 数据目录（新增）
│   └── database.sqlite      # SQLite 数据库文件
├── backups/                 # 备份目录（自动创建）
│   └── database-backup-*.sqlite
├── migrations/              # 迁移目录（自动创建）
│   └── migrated-*.sqlite
└── routes/
    └── database.js          # 数据库管理路由（新增）
```

## 四、数据库配置

### 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| DB_TYPE | 数据库类型 | `sqlite` 或 `postgres` |
| SQLITE_PATH | SQLite文件路径 | `./data/database.sqlite` |
| DATABASE_URL | PostgreSQL连接串 | `postgresql://...` |
| DB_SSL_MODE | PostgreSQL SSL模式 | `false`, `require` |

### SQLite 配置示例

```env
DB_TYPE=sqlite
SQLITE_PATH=./data/database.sqlite
JWT_SECRET=your-secret-key
PORT=3001
```

### PostgreSQL 配置示例

```env
DB_TYPE=postgres
DATABASE_URL=postgresql://user:password@localhost:5432/imagedb
DB_SSL_MODE=false
JWT_SECRET=your-secret-key
PORT=3001
```

## 五、功能使用

### 1. 数据库备份（仅 SQLite）

#### 通过管理后台
1. 登录管理后台
2. 进入"系统设置" → "数据库管理"
3. 点击"创建备份"
4. 自动下载备份文件

#### 通过API
```bash
curl -X POST http://localhost:3001/api/database/backup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. 查看备份列表

```bash
curl http://localhost:3001/api/database/backups \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. 下载备份文件

```bash
curl http://localhost:3001/api/database/backup/download/database-backup-*.sqlite \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o backup.sqlite
```

### 4. 数据库信息

```bash
curl http://localhost:3001/api/database/info \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 六、Docker 部署

### docker-compose.yml 示例

#### 使用 SQLite
```yaml
version: '3.8'

services:
  image-hosting:
    build: ./docker-backend
    ports:
      - "3001:3001"
    environment:
      - DB_TYPE=sqlite
      - SQLITE_PATH=/app/data/database.sqlite
      - JWT_SECRET=your-secret-key
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./backups:/app/backups
    restart: unless-stopped
```

#### 使用 PostgreSQL
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: imagedb
      POSTGRES_USER: dbuser
      POSTGRES_PASSWORD: dbpass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  image-hosting:
    build: ./docker-backend
    ports:
      - "3001:3001"
    environment:
      - DB_TYPE=postgres
      - DATABASE_URL=postgresql://dbuser:dbpass@postgres:5432/imagedb
      - DB_SSL_MODE=false
      - JWT_SECRET=your-secret-key
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

## 七、常见问题

### Q1: SQLite 和 PostgreSQL 如何选择？

**SQLite 适用于：**
- 个人使用或小型团队
- 并发用户少于 10 人
- 简单部署，无需配置数据库
- 数据量较小（< 10GB）

**PostgreSQL 适用于：**
- 多用户并发访问
- 大量数据存储
- 需要高级数据库功能
- 生产环境部署

### Q2: 如何从 SQLite 切换回 PostgreSQL？

目前仅支持 PostgreSQL → SQLite 的迁移。如需切换回 PostgreSQL，建议：
1. 备份 SQLite 数据库
2. 手动迁移数据（可联系开发者获取迁移工具）
3. 或保持使用 SQLite

### Q3: 数据库文件在哪里？

SQLite 数据库文件位置：
- 默认：`server/data/database.sqlite`
- 可通过 `SQLITE_PATH` 环境变量自定义

备份文件位置：
- `server/backups/`

迁移文件位置：
- `server/migrations/`

### Q4: 如何定期备份数据库？

**方法一：使用 cron 定时任务**
```bash
# 每天凌晨 2 点备份
0 2 * * * curl -X POST http://localhost:3001/api/database/backup \
  -H "Authorization: Bearer YOUR_TOKEN" >> /var/log/db-backup.log 2>&1
```

**方法二：手动备份**
```bash
# 直接复制数据库文件
cp server/data/database.sqlite backups/manual-backup-$(date +%Y%m%d).sqlite
```

### Q5: 数据库迁移失败怎么办？

1. 检查 PostgreSQL 连接字符串是否正确
2. 确保 PostgreSQL 服务器可访问
3. 查看服务器日志获取详细错误信息
4. 确保有足够的磁盘空间
5. 如果数据量大，增加超时时间

## 八、升级步骤总结

### 新项目（推荐 SQLite）
```bash
# 1. 安装依赖
cd server && npm install

# 2. 配置环境变量
cat > .env << EOF
DB_TYPE=sqlite
SQLITE_PATH=./data/database.sqlite
JWT_SECRET=$(openssl rand -base64 32)
PORT=3001
EOF

# 3. 启动服务
npm start
```

### 现有项目升级
```bash
# 1. 拉取最新代码
git pull

# 2. 安装新依赖
cd server && npm install

# 3. 保持原有配置或切换到 SQLite
# 选项A：继续使用 PostgreSQL（无需改动）
# 选项B：切换到 SQLite（参考"现有用户迁移"部分）

# 4. 重启服务
npm start
```

## 九、技术支持

如遇到问题，请：
1. 查看服务器日志
2. 检查环境变量配置
3. 确认文件权限
4. 查看 GitHub Issues
5. 提交问题报告

## 十、更新日志

### v2.0.0 (2025-01-20)
- ✨ 新增 SQLite 数据库支持
- ✨ 新增数据库备份功能
- ✨ 新增 PostgreSQL 转 SQLite 功能
- ✨ 新增数据库管理界面
- 🔧 重构数据库层架构
- 📝 完善文档

---

**祝使用愉快！** 🎉

