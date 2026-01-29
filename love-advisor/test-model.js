require('dotenv').config();
const axios = require('axios');

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

console.log('测试 API Key...');
console.log('Key 长度:', KIMI_API_KEY?.length || 0);
console.log('Key 前缀:', KIMI_API_KEY?.substring(0, 30) || '无');
console.log('');

// 测试不同的模型名称
const models = [
    'kimi-k2.5',
    'kimi-k2-5',
    'moonshot-v1-8k',
    'moonshot-v1-32k',
    'moonshot-v1-128k'
];

async function testModel(modelName) {
    console.log(`\n🧪 测试模型: ${modelName}`);
    try {
        const response = await axios.post(
            KIMI_API_URL,
            {
                model: modelName,
                messages: [
                    {
                        role: 'user',
                        content: '你好，这是一个测试'
                    }
                ],
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${KIMI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('✅ 成功！');
        console.log('响应:', response.data.choices[0].message.content);
        return true;
    } catch (error) {
        console.log('❌ 失败');
        if (error.response) {
            console.log('状态码:', error.response.status);
            console.log('错误:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('错误:', error.message);
        }
        return false;
    }
}

async function runTests() {
    for (const model of models) {
        await testModel(model);
    }
}

runTests();
