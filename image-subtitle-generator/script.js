// DOM 元素
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadArea = document.getElementById('uploadArea');
const fileName = document.getElementById('fileName');
const generateBtn = document.getElementById('generateBtn');
const saveBtn = document.getElementById('saveBtn');
const statusMessage = document.getElementById('statusMessage');
const previewCanvas = document.getElementById('previewCanvas');
const previewPlaceholder = document.getElementById('previewPlaceholder');

// 设置项
const subtitleHeight = document.getElementById('subtitleHeight');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');
const strokeColor = document.getElementById('strokeColor');
const fontFamily = document.getElementById('fontFamily');
const fontWeight = document.getElementById('fontWeight');
const bgColor = document.getElementById('bgColor');
const bgOpacity = document.getElementById('bgOpacity');
const subtitleText = document.getElementById('subtitleText');

// 颜色值显示
const fontColorValue = document.getElementById('fontColorValue');
const strokeColorValue = document.getElementById('strokeColorValue');
const bgColorValue = document.getElementById('bgColorValue');

// 存储上传的图片
let uploadedImage = null;

// 初始化事件监听
function init() {
    // 上传按钮点击
    uploadBtn.addEventListener('click', () => fileInput.click());

    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);

    // 拖拽上传
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // 颜色选择器变化
    fontColor.addEventListener('input', () => {
        fontColorValue.textContent = fontColor.value.toUpperCase();
    });
    strokeColor.addEventListener('input', () => {
        strokeColorValue.textContent = strokeColor.value.toUpperCase();
    });
    bgColor.addEventListener('input', () => {
        bgColorValue.textContent = bgColor.value.toUpperCase();
    });

    // 生成和保存按钮
    generateBtn.addEventListener('click', generateSubtitleImage);
    saveBtn.addEventListener('click', saveImage);

    // 初始状态
    updateButtonStates();
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
}

// 处理拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// 处理拖拽放下
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadImage(file);
    } else {
        showStatus('请上传有效的图片文件', true);
    }
}

// 加载图片
function loadImage(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            fileName.textContent = file.name;
            showStatus('图片上传成功！');
            updateButtonStates();

            // 自动生成预览
            generateSubtitleImage();
        };
        img.onerror = () => {
            showStatus('图片加载失败，请重试', true);
        };
        img.src = e.target.result;
    };

    reader.onerror = () => {
        showStatus('文件读取失败，请重试', true);
    };

    reader.readAsDataURL(file);
}

// 生成字幕图片
function generateSubtitleImage() {
    if (!uploadedImage) {
        showStatus('请先上传图片', true);
        return;
    }

    const ctx = previewCanvas.getContext('2d');
    const img = uploadedImage;

    // 获取设置值
    const height = parseInt(subtitleHeight.value) || 80;
    const size = parseInt(fontSize.value) || 40;
    const textColor = fontColor.value;
    const outlineColor = strokeColor.value;
    const family = fontFamily.value;
    const weight = fontWeight.value;
    const backgroundColor = bgColor.value;
    const opacity = (parseInt(bgOpacity.value) || 50) / 100;

    // 获取字幕内容（按行分割）
    const lines = subtitleText.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    // 设置画布尺寸
    previewCanvas.width = img.width;
    previewCanvas.height = img.height;

    // 绘制原图
    ctx.drawImage(img, 0, 0);

    // 如果有字幕内容，绘制字幕
    if (lines.length > 0) {
        // 计算字幕区域起始位置（从底部向上）
        const totalSubtitleHeight = lines.length * height;
        let startY = img.height - totalSubtitleHeight;

        // 解析背景颜色
        const bgRgb = hexToRgb(backgroundColor);

        // 绘制每行字幕
        lines.forEach((line, index) => {
            const y = startY + index * height;

            // 绘制半透明背景条
            ctx.fillStyle = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})`;
            ctx.fillRect(0, y, img.width, height);

            // 设置字体
            ctx.font = `${weight} ${size}px ${family}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 计算文字位置（居中于背景条）
            const textX = img.width / 2;
            const textY = y + height / 2;

            // 绘制文字描边
            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = Math.max(2, size / 15);
            ctx.lineJoin = 'round';
            ctx.strokeText(line, textX, textY);

            // 绘制文字填充
            ctx.fillStyle = textColor;
            ctx.fillText(line, textX, textY);
        });
    }

    // 显示画布
    previewPlaceholder.style.display = 'none';
    previewCanvas.classList.add('visible');

    showStatus('字幕图片生成成功！');
    updateButtonStates();
}

// 保存图片
function saveImage() {
    if (!previewCanvas.classList.contains('visible')) {
        showStatus('请先生成字幕图片', true);
        return;
    }

    // 创建下载链接
    const link = document.createElement('a');
    link.download = `subtitle_${Date.now()}.png`;
    link.href = previewCanvas.toDataURL('image/png');
    link.click();

    showStatus('图片保存成功！');
}

// 十六进制颜色转 RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// 显示状态消息
function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message' + (isError ? ' error' : '');

    // 3秒后清除消息
    setTimeout(() => {
        if (statusMessage.textContent === message) {
            statusMessage.textContent = '';
        }
    }, 3000);
}

// 更新按钮状态
function updateButtonStates() {
    generateBtn.disabled = !uploadedImage;
    saveBtn.disabled = !previewCanvas.classList.contains('visible');
}

// 初始化
init();
