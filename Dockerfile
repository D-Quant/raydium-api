# 使用特定版本的 Node.js
FROM node:22.0.0

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 编译 TypeScript 代码
RUN npm run build

# 重建原生模块
RUN npm rebuild

# 暴露应用运行端口
EXPOSE 8000

# 定义环境变量：钱包私钥
ENV WALLET_SECRET_KEY=""
# 定义环境变量：Solana节点URL
ENV ENDPOINT_URL=""

# 启动应用
CMD [ "sh", "-c", "node dist/index.js $WALLET_SECRET_KEY $ENDPOINT_URL" ]
