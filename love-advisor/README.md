# 恋爱军师 💕

一款极简的 AI 情感分析 H5 应用，通过分析朋友圈截图，给出简短有效的追求建议。

## 功能特点

- 🌸 粉红恋爱风格 UI，浪漫氛围满满
- 📸 单页面完成上传、分析、查看结果
- 🤖 基于 Kimi 2.5 AI 多模态分析
- 💡 简短有效的追求策略建议
- 🔒 图片分析后立即删除，保护隐私

## 快速开始

### 1. 获取 Kimi API Key

访问 [Moonshot AI 平台](https://platform.moonshot.cn/) 注册并获取 API Key。

### 2. 安装依赖

```bash
cd love-advisor
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Kimi API Key：

```
KIMI_API_KEY=sk-your-actual-api-key
```

### 4. 启动服务

```bash
npm start
```

### 5. 打开应用

在浏览器中访问 `http://localhost:3000`

## 使用说明

1. 上传至少 5 张心动对象的朋友圈截图
2. 点击「开始分析」按钮
3. 等待 AI 分析完成（约 30-60 秒）
4. 查看分析结果：TA 的画像、追求策略、成功概率

## 项目结构

```
love-advisor/
├── index.html      # 前端页面
├── server.js       # 后端代理服务
├── package.json    # 依赖配置
├── .env.example    # 环境变量示例
└── README.md       # 项目说明
```

## 技术栈

- **前端**: HTML5 + TailwindCSS (CDN)
- **后端**: Node.js + Express
- **AI**: Kimi 2.5 (Moonshot AI)

## 注意事项

- 请确保上传的朋友圈截图清晰可见
- AI 分析结果仅供参考，追求他人时请保持尊重和真诚
- API 调用可能产生费用，请注意控制使用频率

## License

MIT
