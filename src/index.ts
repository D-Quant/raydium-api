import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import accountRoutes from './account/routes';
import swapRoutes from "./swap/routes";

const app = new Koa();
const router = new Router();

// 使用 bodyParser 中间件解析请求体
app.use(bodyParser());

// 加载 account 模块路由
router.use('/account', accountRoutes.routes(), accountRoutes.allowedMethods());

// 加载 swap 模块路由
router.use('/swap', swapRoutes.routes(), swapRoutes.allowedMethods());

// 使用主路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务器
const PORT = 5008;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});