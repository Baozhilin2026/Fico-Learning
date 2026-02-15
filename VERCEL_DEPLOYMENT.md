# Vercel 部署指南 - Google Cloud TTS

## 概述

这个项目现在支持两种 TTS 引擎：
1. **浏览器内置 TTS**（默认）- 免费，无需配置
2. **Google Cloud TTS** - 需要配置，但音质更好且跨设备一致

## Google Cloud TTS 设置步骤

### 1. 获取 Google Cloud API 密钥

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 导航到 "APIs & Services" > "Credentials"
4. 点击 "Create Credentials" > "API Key"
5. 复制生成的 API 密钥

### 2. 启用 Text-to-Speech API

1. 在 Google Cloud Console 中，导航到 "APIs & Services" > "Library"
2. 搜索 "Cloud Text-to-Speech API"
3. 点击启用

### 3. 部署到 Vercel

#### 方式一：通过 Vercel 网站（推荐）

1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 "Add New Project"
3. 导入你的 GitHub 仓库：`Baozhilin2026/Fico-Learning`
4. 在配置页面：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 在 **Environment Variables** 部分添加：
   - **Name**: `GOOGLE_CLOUD_API_KEY`
   - **Value**: 粘贴你的 Google Cloud API 密钥
6. 点击 "Deploy"

#### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 添加环境变量
vercel env add GOOGLE_CLOUD_API_KEY

# 生产部署
vercel --prod
```

### 4. 使用 Google Cloud TTS

部署完成后，在应用中切换到 Google Cloud TTS 引擎。

#### 在设置中添加引擎切换选项（待实现）

或者在浏览器控制台测试：

```javascript
// 切换到 Google Cloud TTS
window.setTTSEngine('google')

// 切换回浏览器 TTS
window.setTTSEngine('web')
```

## API 配额和费用

- Google Cloud TTS 有免费配额：
  - 每月 100 万字符（标准语音）
  - 每月 100 万字符（WaveNet 语音）
  
- 超出免费配额后：
  - 标准语音：$4.00 / 100 万字符
  - WaveNet 语音：$16.00 / 100 万字符

## 故障排除

### API 密钥错误

如果你看到 "API key not configured" 错误：
1. 确认在 Vercel 项目设置中添加了环境变量
2. 尝试重新部署项目以应用环境变量

### CORS 错误

如果你看到 CORS 错误：
1. 确认使用的是 Vercel 部署的 URL（不是 GitHub Pages）
2. 确认 API 路由正确配置

### 音频无法播放

1. 检查浏览器控制台错误信息
2. 确认 Google Cloud API 配额未用完
3. 检查 API 密钥是否有正确的权限

## Vercel 免费额度

- **执行时间**: 100 小时/月
- **带宽**: 100 GB/月
- **服务器less 函数执行**: 100,000 次/月
- **请求超时**: 10 秒（Hobby 计划）

对于个人学习使用，这些额度应该足够了。
