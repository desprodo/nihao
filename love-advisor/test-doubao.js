require('dotenv').config();
const axios = require('axios');

const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY;
const DOUBAO_MODEL_ID = process.env.DOUBAO_MODEL_ID;
const DOUBAO_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

console.log('测试豆包 API...');
console.log('API Key 长度:', DOUBAO_API_KEY?.length || 0);
console.log('Model ID:', DOUBAO_MODEL_ID || '未配置');
console.log('');

async function testDoubao() {
    try {
        const response = await axios.post(
            DOUBAO_API_URL,
            {
                model: DOUBAO_MODEL_ID,
                messages: [
                    {
                        role: 'user',
                        content: '你好，这是一个测试消息'
                    }
                ],
                max_tokens: 100
            },
            {
                headers: {
                    'Authorization': `Bearer ${DOUBAO_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('✅ 豆包 API 测试成功！');
        console.log('响应:', response.data.choices[0].message.content);
    } catch (error) {
        console.log('❌ 豆包 API 测试失败');
        if (error.response) {
            console.log('状态码:', error.response.status);
            console.log('错误详情:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('错误:', error.message);
        }
    }
}

testDoubao();
