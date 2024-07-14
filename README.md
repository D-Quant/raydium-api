# Raydium-Api

基于Raydium SDK 的交易接口API服务
接口文档：ApiPost
## 安装

### 1.基于docker运行
#### 下载镜像
```bash
docker pull initsysctrl/raydium-api:latest
```
#### 运行容器
```bash
docker run -itd --name raydium-api -p 8000:8000 -e WALLET_SECRET_KEY="<your_wallet_secret_key>" -e ENDPOINT_URL="<your_solana_endpoint_url>" initsysctrl/raydium-api
```
参数说明：
- port api服务端口
- WALLET_SECRET_KEY: 钱包私钥
- ENDPOINT_URL: solana节点URL


你可以通过使用多个钱包私钥和端口来重复开启多个服务，每个服务只有一个钱包私钥，使用该服务进行的所有交易都由这个私钥签名
```bash
docker run -itd --name raydium-api-1 -p 8001:8000 -e WALLET_SECRET_KEY="钱包01 私钥" -e ENDPOINT_URL="你的节点URL" initsysctrl/raydium-api

docker run -itd --name raydium-api-2 -p 8002:8000 -e WALLET_SECRET_KEY="钱包02 私钥" -e ENDPOINT_URL="你的节点URL" initsysctrl/raydium-api

docker run -itd --name raydium-api-3 -p 8003:8000 -e WALLET_SECRET_KEY="钱包03 私钥" -e ENDPOINT_URL="你的节点URL" initsysctrl/raydium-api
```
#### 查看运行日志
```bash
docker logs -f --tail 100 raydium-api
```

#### 更新进行
```bash
docker pull initsysctrl/raydium-api:latest
```

### 2.本地编译docker镜像
```bash
make build
```
其余操作与方式1相同，当镜像为`raydium-api`而不是`initsysctrl/raydium-api`

