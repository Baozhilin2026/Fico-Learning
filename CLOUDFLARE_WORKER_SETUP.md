# Cloudflare Workers TTS 代理部署指南

## 为什么使用 Cloudflare Workers？

- ✅ **国内可访问** - Cloudflare 有中国边缘节点
- ✅ **安全** - API 密钥存储在服务端，不暴露给用户
- ✅ **免费额度** - 每天 10 万次免费请求
- ✅ **无需服务器** - Serverless 架构，自动扩缩容
- ✅ **部署简单** - 5 分钟完成

---

## 部署步骤

### 1. 注册 Cloudflare 账号

1. 访问 https://dash.cloudflare.com/sign-up
2. 使用邮箱注册（免费）

### 2. 获取腾讯云 API 密钥

1. 访问 https://console.cloud.tencent.com/cam/capi
2. 记下 `SecretId` 和 `SecretKey`

### 3. 创建 Cloudflare Worker

1. 登录 Cloudflare Dashboard
2. 左侧菜单 → **Workers & Pages**
3. 点击 **"Create application"**
4. 选择 **"Create Worker"**
5. 命名为 `fico-tts-proxy`
6. 点击 **"Deploy"**

### 4. 配置 Worker 代码

1. 打开项目中的 `cloudflare-worker/worker.js` 文件
2. 复制全部代码
3. 在 Cloudflare Worker 编辑页面中：
   - 删除默认代码
   - 粘贴 `worker.js` 的内容
4. 点击 **"Save and Deploy"**

### 5. 配置环境变量

1. 在 Worker 页面，点击 **"Settings"** 标签
2. 点击 **"Variables and Secrets"**
3. 添加以下环境变量：

| 变量名 | 值 | 类型 |
|--------|-----|------|
| `TENCENT_TTS_SECRET_ID` | 你的 SecretId | 普通 |
| `TENCENT_TTS_SECRET_KEY` | 你的 SecretKey | 加密 |

**重要**：使用 **"Encrypted"** 类型存储 `SECRET_KEY`，更安全。

4. 点击 **"Save and deploy"**

### 6. 获取 Worker URL

1. 在 Worker 页面，URL 格式为：
   ```
   https://fico-tts-proxy.YOUR_SUBDOMAIN.workers.dev
   ```

2. 记下这个 URL

---

## 配置前端项目

### 1. 创建环境变量文件

在项目根目录创建 `.env` 文件：

```bash
VITE_CLOUDFLARE_WORKER_URL=https://fico-tts-proxy.YOUR_SUBDOMAIN.workers.dev
```

### 2. 重启开发服务器

```bash
npm run dev
```

---

## 部署到生产环境

### 部署前端到静态托管平台

**推荐国内平台：**

| 平台 | 优势 | 价格 |
|------|------|------|
| **阿里云 OSS + CDN** | 国内速度快 | 按量计费 |
| **腾讯云 COS + CDN** | 国内速度快 | 按量计费 |
| **Gitee Pages** | 完全免费 | 免费 |
| **Vercel + 国内加速** | 简单 | 付费 |

---

## 验证配置

1. 打开网站
2. 点击任意单词朗读按钮
3. 浏览器控制台应显示：
   ```
   [Cloudflare TTS] Fetching from Cloudflare Worker
   [Cloudflare TTS] Audio ready, starting playback
   ```

4. 能听到标准英语发音

---

## 费用说明

**Cloudflare Workers（免费套餐）：**
- 每天 100,000 次请求
- 每月 300 万次请求
- 超出后 $5/百万次请求

**腾讯云 TTS（免费套餐）：**
- 每月 100 万次调用
- 超出后 ¥0.016/千次

对于个人学习网站，免费额度完全够用！

---

## 故障排除

### CORS 错误
确保 Worker 代码包含正确的 CORS 头：
```javascript
'Access-Control-Allow-Origin': '*'
```

### API 密钥错误
检查 Cloudflare Worker 的环境变量是否正确配置

### Worker URL 404
1. 检查 Worker 是否已部署
2. 确认 URL 格式正确
3. 检查 `.env` 文件中的 URL 是否正确

### 腾讯云 API 错误
1. 确认已开通 TTS 服务
2. 检查账户是否有剩余额度
3. 查看 Worker 日志获取详细错误信息
