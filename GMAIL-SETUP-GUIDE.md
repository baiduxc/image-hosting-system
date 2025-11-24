# Gmail 邮件配置完整指南

## 问题现象

✅ 测试发送成功  
❌ 但没有收到邮件

## 原因分析

Gmail 有特殊的安全要求，不能直接使用账户密码进行 SMTP 认证，需要使用**应用专用密码**。

## 解决方案

### 方法一：使用应用专用密码（推荐）

#### 步骤 1: 启用两步验证

1. 访问 Google 账户安全设置：https://myaccount.google.com/security
2. 找到"登录 Google"部分
3. 点击"两步验证"
4. 按照提示启用两步验证

#### 步骤 2: 生成应用专用密码

1. 访问应用专用密码页面：https://myaccount.google.com/apppasswords
2. 如果没有看到此选项，可能是因为：
   - 未启用两步验证
   - 账户是工作或学校账户（由管理员控制）
   - 已启用高级保护计划

3. 在"选择应用"下拉菜单中选择"邮件"
4. 在"选择设备"下拉菜单中选择"其他（自定义名称）"
5. 输入名称，例如："图床系统"
6. 点击"生成"
7. **复制生成的 16 位密码**（格式如：`xxxx xxxx xxxx xxxx`）

#### 步骤 3: 配置图床系统

在系统设置 → 邮件服务中填写：

```
SMTP 服务器: smtp.gmail.com
SMTP 端口: 587 (推荐) 或 465
SSL/TLS 加密: 
  - 端口 587: 关闭（使用 STARTTLS）
  - 端口 465: 开启（使用 SSL）
发件人邮箱: your-email@gmail.com
发件人名称: 图床系统
SMTP 用户名: your-email@gmail.com
SMTP 密码: 刚才生成的16位应用专用密码（去掉空格）
测试邮箱: test-recipient@example.com
```

**重要：** SMTP 密码使用应用专用密码，不是你的 Gmail 账户密码！

### 方法二：允许不够安全的应用（不推荐）

⚠️ **注意：** Google 已逐步淘汰此选项，不推荐使用。

1. 访问：https://myaccount.google.com/lesssecureapps
2. 开启"允许不够安全的应用"
3. 使用 Gmail 账户密码作为 SMTP 密码

## 配置示例

### 端口 587（推荐，使用 STARTTLS）

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
FROM_EMAIL=your-email@gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxxxxxxxxxx  # 16位应用专用密码
```

### 端口 465（使用 SSL）

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
FROM_EMAIL=your-email@gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxxxxxxxxxx  # 16位应用专用密码
```

## 测试发送

配置完成后：

1. 进入"系统设置" → "邮件服务"
2. 填写配置信息
3. 填写测试邮箱地址
4. 点击"测试邮件发送"
5. 查看服务器日志获取详细信息

### 日志示例

**成功的日志：**
```
📧 开始邮件配置测试...
SMTP服务器: smtp.gmail.com:587
使用SSL: false
认证用户: your-email@gmail.com
🔍 检测到 Gmail，应用特殊配置...
⚠️ 提示: Gmail 需要使用"应用专用密码"而不是账户密码
🔐 验证 SMTP 连接...
✅ SMTP 连接验证成功
📤 发送测试邮件...
✅ 邮件发送成功！
消息ID: <xxxxx@gmail.com>
响应: 250 2.0.0 OK
已接受: [ 'test@example.com' ]
```

## 常见问题

### Q1: 显示发送成功但没收到邮件

**可能原因：**
1. 邮件在垃圾邮件文件夹
2. 使用了账户密码而不是应用专用密码
3. 收件人邮箱地址错误
4. 邮件服务器延迟（等待 5-10 分钟）

**解决方法：**
1. 检查垃圾邮件/促销邮件文件夹
2. 确认使用应用专用密码
3. 查看服务器日志中的 `accepted` 和 `rejected` 字段
4. 尝试发送到不同的邮箱地址

### Q2: 错误 "Invalid login: 535-5.7.8 Username and Password not accepted"

**原因：** 密码错误或未使用应用专用密码

**解决方法：**
1. 确保已启用两步验证
2. 生成新的应用专用密码
3. 复制密码时去掉空格
4. 确认用户名是完整的邮箱地址

### Q3: 错误 "EAUTH: Authentication failed"

**原因：** 认证失败

**解决方法：**
1. 重新生成应用专用密码
2. 确认用户名和密码都正确
3. 检查是否有特殊字符需要转义

### Q4: 端口 587 还是 465？

**推荐使用 587（STARTTLS）：**
- 更现代的加密方式
- 先建立连接，再升级到 TLS
- 配置：`SMTP_PORT=587, SMTP_SECURE=false`

**也可以使用 465（SSL）：**
- 传统的 SSL 加密
- 从一开始就使用加密连接
- 配置：`SMTP_PORT=465, SMTP_SECURE=true`

### Q5: 可以使用 G Suite（Google Workspace）吗？

可以，配置相同，但需要注意：
- 使用组织邮箱地址（如：`name@company.com`）
- 可能需要管理员启用"不够安全的应用"访问权限
- SMTP 服务器仍然是 `smtp.gmail.com`

### Q6: 发送限制是多少？

Gmail SMTP 限制：
- 个人账户：每天 500 封
- Google Workspace：每天 2000 封
- 每封邮件最多 100 个收件人
- 每分钟建议不超过 20 封

## 调试技巧

### 1. 查看详细日志

重启服务器后，日志会显示详细的 SMTP 连接信息：

```bash
# 查看实时日志
tail -f logs/server.log

# 或在 Docker 中
docker logs -f image-hosting
```

### 2. 测试 SMTP 连接

使用命令行测试：

```bash
# 使用 telnet 测试连接
telnet smtp.gmail.com 587

# 或使用 openssl（端口 465）
openssl s_client -connect smtp.gmail.com:465 -crlf
```

### 3. 验证配置

```bash
# 进入容器
docker exec -it image-hosting sh

# 测试 DNS 解析
nslookup smtp.gmail.com

# 测试端口连通性
nc -zv smtp.gmail.com 587
```

## 其他邮件服务商配置

### Outlook/Hotmail

```
SMTP服务器: smtp-mail.outlook.com
端口: 587
SSL/TLS: STARTTLS (关闭 secure)
```

### QQ邮箱

```
SMTP服务器: smtp.qq.com
端口: 587 或 465
需要开启 SMTP 服务并使用授权码
```

### 163邮箱

```
SMTP服务器: smtp.163.com
端口: 465
SSL/TLS: 开启
需要开启 SMTP 服务并使用授权码
```

### 自定义 SMTP 服务器

适用于企业邮箱或自建邮件服务器：

```
SMTP服务器: mail.yourdomain.com
端口: 25/587/465（根据服务器配置）
用户名: 完整邮箱地址或用户名
密码: 邮箱密码
```

## 安全建议

1. **使用应用专用密码**
   - 不要在代码中硬编码密码
   - 使用环境变量存储敏感信息
   - 定期更换应用专用密码

2. **限制邮件发送频率**
   - 避免被识别为垃圾邮件
   - 遵守邮件服务商的发送限制

3. **监控邮件发送**
   - 记录发送日志
   - 监控失败率
   - 定期检查邮件送达情况

4. **防止滥用**
   - 实施频率限制
   - 验证收件人地址
   - 添加发送确认机制

## 故障排查清单

- [ ] 已启用 Gmail 两步验证
- [ ] 已生成应用专用密码
- [ ] 使用正确的 SMTP 服务器（smtp.gmail.com）
- [ ] 使用正确的端口（587 或 465）
- [ ] SSL/TLS 设置与端口匹配
- [ ] 用户名是完整的邮箱地址
- [ ] 密码是应用专用密码（不是账户密码）
- [ ] 测试邮箱地址正确
- [ ] 检查了垃圾邮件文件夹
- [ ] 查看了服务器日志
- [ ] 网络可以访问 Gmail 服务器

## 参考链接

- [Google 应用专用密码](https://myaccount.google.com/apppasswords)
- [Google 两步验证](https://myaccount.google.com/security)
- [Gmail SMTP 设置](https://support.google.com/mail/answer/7126229)
- [Nodemailer 文档](https://nodemailer.com/)

---

**最后更新：** 2025-01-20  
**适用版本：** v2.0.0+

如仍有问题，请提供服务器日志以便诊断。

