// noinspection SpellCheckingInspection

import Router from 'koa-router';
import {sendErrorResponse} from '../utils/response';
import {initSdk} from '../config'
import {Raydium} from "@raydium-io/raydium-sdk-v2";

const router = new Router();

// 定义请求体接口
interface UpdateAccountRequestBody {
    name: string;
    email: string;
}

// 获取账户的sol余额
router.get('/balance', async (ctx) => {
    const raydium: Raydium = await initSdk()
    ctx.body = await raydium.connection.getBalance(raydium.ownerPubKey)
})

// 获取账户的token balance
router.get('/token_balance', async (ctx) => {
    ctx.body = {todo: "todo"}
})

// GET /account/info
router.get('/info', async (ctx) => {
    const userId = ctx.query.userId;
    if (typeof userId !== 'string') {
        sendErrorResponse(ctx, 400, 'Invalid request body');
        return;
    }
    ctx.body = {message: `Account info for user ${userId}`};
});

// POST /account/update
router.post('/update', async (ctx) => {
    const body = ctx.request.body as UpdateAccountRequestBody;
    const {name, email} = body;
    if (!name || !email) {
        sendErrorResponse(ctx, 400, 'Invalid request body');
        return;
    }
    ctx.body = {message: 'Account updated', data: {name, email}};
});

export default router;