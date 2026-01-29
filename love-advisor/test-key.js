require('dotenv').config();
const axios = require('axios');

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

console.log('测试 API Key...');
console.log('Key 长度:', KIMI_API_KEY.length);
console.log('Key 前缀:', KIMI_API_KEY.substring(0, 30));

async function testKey() {
    try {
        const response = await axios.post(
            KIMI_API_URL,
            {
                model: 'kimi-k2.5',
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

        console.log('\n✅ API Key 有效！');
        console.log('响应:', response.data.choices[0].message.content);
    } catch (error) {
        console.log('\n❌ API Key 测试失败');

        if (error.response) {
            console.log('状态码:', error.response.status);
            console.log('错误详情:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('错误:', error.message);
        }
    }
}

testKey();
