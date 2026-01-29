const fs = require('fs');
const axios = require('axios');
const path = require('path');

const API_URL = 'http://localhost:3000/api/analyze';

// 读取5张图片并转换为 base64
const imageFiles = [
    '微信图片_2026-01-29_220649_337.jpg',
    '微信图片_2026-01-29_220711_622.jpg',
    '微信图片_2026-01-29_220720_122.jpg',
    '微信图片_2026-01-29_220736_573.jpg',
    '微信图片_2026-01-29_220753_223.jpg'
];

async function testAPI() {
    console.log('🔄 正在读取图片...');
    const images = [];

    for (const file of imageFiles) {
        const filePath = path.join(__dirname, file);
        const data = fs.readFileSync(filePath);
        const base64 = `data:image/jpeg;base64,${data.toString('base64')}`;
        images.push(base64);
        console.log(`  ✓ ${file} - ${(data.length / 1024).toFixed(1)}KB`);
    }

    console.log(`\n📤 发送请求到 ${API_URL}`);
    console.log(`⏱️  预计等待时间: 30-120 秒\n`);

    const startTime = Date.now();

    try {
        const response = await axios.post(API_URL, { images }, {
            timeout: 180000, // 3分钟超时
            headers: { 'Content-Type': 'application/json' }
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n✅ 请求成功！耗时: ${duration} 秒\n`);
        console.log('📊 返回结果:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n❌ 请求失败！耗时: ${duration} 秒\n`);

        if (error.response) {
            console.log('错误响应:', error.response.status);
            console.log(error.response.data);
        } else if (error.code === 'ECONNABORTED') {
            console.log('错误: 请求超时');
        } else {
            console.log('错误:', error.message);
        }
    }
}

testAPI();
