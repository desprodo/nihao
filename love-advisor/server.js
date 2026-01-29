const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 豆包 API 配置
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;
const DOUBAO_MODEL_ID = process.env.DOUBAO_MODEL_ID;
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 调试：检查 API Key 是否加载
console.log('API Key 加载状态:', DOUBAO_API_KEY ? '已加载' : '未加载');
console.log('API Key 长度:', DOUBAO_API_KEY ? DOUBAO_API_KEY.length : 0);
console.log('Model ID:', DOUBAO_MODEL_ID ? '已配置' : '未配置');

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 静态文件服务
app.use(express.static('.'));

// System Prompt
const SYSTEM_PROMPT = `你是一个追求异性的高手，对于青春男女生的心理和外在表现，有非常强的洞察，也有一套很厉害的追求异性的技巧！擅长于输出简短但有效的分析和建议。

你的任务是基于用户提供的朋友圈截图，快速分析目标对象的画像，并给出可直接执行的追求策略。

输出要求：
1. 简短精炼，不要长篇大论
2. 分析要直击要害，建议要 actionable
3. 语气像朋友一样给出建议，不要太学术
4. 输出必须是 JSON 格式

输出字段：
- profile: TA 的画像（tags: 性格标签数组, emotionStatus: 情感状态字符串）
- strategy: 追求策略（iceBreaker: 破冰建议字符串, topics: 推荐话题数组, warning: 避雷提醒字符串）
- successRate: 成功概率（difficulty: 难度星级1-5数字, keyAdvice: 核心建议字符串）`;

// 分析接口
app.post('/api/analyze', async (req, res) => {
    try {
        const { images } = req.body;

        if (!images || !Array.isArray(images) || images.length < 5) {
            return res.status(400).json({
                code: -1,
                message: '请至少上传 5 张图片'
            });
        }

        // 构建消息内容
        const content = [
            {
                type: 'text',
                text: '请分析以下朋友圈截图中的心动对象，快速给出 TA 的画像、追求策略和成功概率评估。以 JSON 格式返回，要求简短有效，直击要害。'
            },
            ...images.map(base64 => ({
                type: 'image_url',
                image_url: {
                    url: `data:image/jpeg;base64,${base64}`
                }
            }))
        ];

        // 调用豆包 API
        const response = await axios.post(
            DOUBAO_API_URL,
            {
                model: DOUBAO_MODEL_ID,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: content
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${DOUBAO_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 120000 // 2分钟超时
            }
        );

        // 解析 AI 返回的内容
        const aiResponse = response.data.choices[0].message.content;

        // 尝试提取 JSON
        let result;
        try {
            // 先尝试直接解析
            result = JSON.parse(aiResponse);
        } catch (e) {
            // 如果失败，尝试从 markdown 代码块中提取
            const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) ||
                             aiResponse.match(/```([\s\S]*?)```/) ||
                             aiResponse.match(/{[\s\S]*}/);

            if (jsonMatch) {
                result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } else {
                throw new Error('无法解析 AI 返回的数据');
            }
        }

        // 验证返回结构
        const validatedResult = {
            profile: {
                tags: result.profile?.tags || ['温柔', '有趣', '神秘'],
                emotionStatus: result.profile?.emotionStatus || '可能是单身'
            },
            strategy: {
                iceBreaker: result.strategy?.iceBreaker || '从共同的兴趣爱好聊起',
                topics: result.strategy?.topics || ['美食', '旅行', '电影'],
                warning: result.strategy?.warning || '不要操之过急，先做朋友'
            },
            successRate: {
                difficulty: Math.min(5, Math.max(1, result.successRate?.difficulty || 3)),
                keyAdvice: result.successRate?.keyAdvice || '保持真诚，展现你的优点'
            }
        };

        res.json({
            code: 0,
            data: validatedResult
        });

    } catch (error) {
        console.error('分析错误:', error.message);

        // 详细错误日志
        if (error.response) {
            console.error('API 响应状态:', error.response.status);
            console.error('API 响应数据:', JSON.stringify(error.response.data, null, 2));
        }

        // 根据错误类型返回不同的错误信息
        let errorMessage = '分析服务暂时不可用，请稍后重试';
        let errorCode = -1;

        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                errorMessage = 'API 认证失败，请联系管理员检查 API Key';
                errorCode = 401;
            } else if (status === 429) {
                errorMessage = '请求过于频繁，请稍后再试';
                errorCode = 429;
            } else if (status >= 500) {
                errorMessage = 'AI 服务繁忙，请稍后再试';
                errorCode = status;
            }
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = '分析超时，请减少图片数量或稍后重试';
            errorCode = -2;
        }

        res.status(500).json({
            code: errorCode,
            message: errorMessage
        });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`🌸 恋爱军师服务已启动: http://localhost:${PORT}`);
    console.log(`💕 请在浏览器中打开以上链接开始使用`);
});
