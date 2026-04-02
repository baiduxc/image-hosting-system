# 社媒平台 Cookie 获取与配置说明（抖音 / X / YouTube）


curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux -o /usr/local/bin/yt-dlp
chmod +x /usr/local/bin/yt-dlp
export YT_DLP_BINARY=/usr/local/bin/yt-dlp


本文用于手动配置 `yt-dlp` 所需 Cookie，提升社媒视频转存成功率。

## 1. 适用场景

当出现以下报错时，通常需要配置 Cookie：

- Douyin: `Fresh cookies ... are needed`
- YouTube: `Sign in to confirm you’re not a bot`
- X/Twitter: 受限内容、登录态校验导致无法解析视频

---

## 2. Cookie 获取方式（推荐）

推荐使用浏览器扩展导出 **Netscape 格式** 的 `cookies.txt`。

可选扩展（Chrome/Edge/Firefox）：
- `Get cookies.txt LOCALLY`
- `cookies.txt`

> 注意：必须导出目标站点对应域名的 Cookie，并尽量保持“新鲜”（最近登录过）。

---

## 3. 三个平台分别导出

### 3.1 抖音（Douyin）
1. 浏览器登录抖音账号并打开任意视频页：`https://www.douyin.com/`
2. 用扩展导出 `douyin.com` 的 cookies 为 `douyin-cookies.txt`

### 3.2 X（Twitter）
1. 浏览器登录 X：`https://x.com/`
2. 导出 `x.com`（必要时包含 `twitter.com`）cookies 为 `x-cookies.txt`

### 3.3 YouTube
1. 浏览器登录 YouTube：`https://www.youtube.com/`
2. 导出 `youtube.com`（必要时包含 `google.com` 相关登录态）cookies 为 `youtube-cookies.txt`

---

## 4. 服务器存放建议

在服务器创建目录并上传 Cookie 文件：

```bash
mkdir -p ../config/cookies
```

建议路径：
- `../config/cookies/douyin-cookies.txt`
- `../config/cookies/x-cookies.txt`
- `/config/cookies/youtube-cookies.txt`

并设置权限：

```bash
chmod 600 ../config/cookies/*.txt
```

---

## 5. 当前项目配置方式（已支持按域名自动切换）

后端会按 URL 域名自动选择以下环境变量：

- `YT_DLP_COOKIES_DOUYIN`
- `YT_DLP_COOKIES_X`
- `YT_DLP_COOKIES_YOUTUBE`
- `YT_DLP_COOKIES_TELEGRAM`

通用兜底：
- `YT_DLP_COOKIES_FILE`
- `YT_DLP_COOKIES`

其他可选项：
- `YT_DLP_PROXY`
- `YT_DLP_BINARY`

### 5.1 仅用 `.env` 配置（无需改代码）

你可以只在 `.env` 里配置，支持两种形式：

1) **文件路径**（推荐）
```env
YT_DLP_COOKIES_DOUYIN=../config/cookies/douyin-cookies.txt
YT_DLP_COOKIES_X=../config/cookies/x-cookies.txt
YT_DLP_COOKIES_YOUTUBE=../config/cookies/youtube-cookies.txt
YT_DLP_COOKIES_TELEGRAM=../config/cookies/telegram-cookies.txt
```

2) **直接写 Cookie 内容**（Netscape 文本）
```env
YT_DLP_COOKIES_DOUYIN=# Netscape HTTP Cookie File\n.douyin.com\tTRUE\t/\tTRUE\t2147483647\tsessionid\txxx
```

也支持 base64：
```env
YT_DLP_COOKIES_DOUYIN_BASE64=BASE64_ENCODED_COOKIE_TXT
```

> 程序会自动把 `.env` 中的 Cookie 内容落盘为临时 `cookies.txt`，然后传给 `yt-dlp`。

### 5.2 如需代理（可选）

```bash
export YT_DLP_PROXY=http://127.0.0.1:7890
```

---

## 6. 命令行自测（先于接口）

建议先在服务器直接跑 `yt-dlp` 验证：

### 抖音
```bash
/usr/local/bin/yt-dlp --cookies ../config/cookies/douyin-cookies.txt "https://v.douyin.com/xxxxx/" -o /tmp/douyin-test.%(ext)s
```

### X
```bash
/usr/local/bin/yt-dlp --cookies ../config/cookies/x-cookies.txt "https://x.com/xxx/status/xxxxx" -o /tmp/x-test.%(ext)s
```

### YouTube
```bash
/usr/local/bin/yt-dlp --cookies ../config/cookies/youtube-cookies.txt "https://youtube.com/shorts/xxxxx" -o /tmp/yt-test.%(ext)s
```

命令行可下载，再测项目 `/api/transfer`。

---

## 7. 常见问题

### Q1: 配了 Cookie 还是失败？
- Cookie 可能过期，重新导出。
- 服务器 IP 被风控，配代理后重试。
- 链接内容本身受限（私密、年龄限制、地区限制）。

### Q2: 能不能只在 `.env` 里配置？
可以。支持：
- `.env` 写文件路径；或
- `.env` 直接写 Netscape Cookie 文本；或
- `.env` 写 base64（`*_BASE64`）。

### Q3: Cookie 安全建议
- 仅服务器可读（`chmod 600`）
- 不要提交到 Git 仓库
- 定期轮换/更新

---

## 8. 快速操作清单

1. 导出三个平台 cookies.txt
2. 在 `.env` 配置 `YT_DLP_COOKIES_DOUYIN/X/YOUTUBE/TELEGRAM`
3. 重启服务
4. 先命令行验证，再页面转存验证

