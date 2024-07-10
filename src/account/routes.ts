// noinspection SpellCheckingInspection

import Router from 'koa-router';
import {sendErrorResponse} from '../utils/response';
import {initSdk} from '../config'
import {Raydium} from "@raydium-io/raydium-sdk-v2";
import {PublicKey} from "@solana/web3.js"

const router = new Router();

// 定义请求体接口
interface UpdateAccountRequestBody {
    name: string;
    email: string;
}

// 获取账户的sol余额
router.get('/balance', async (ctx) => {
    const raydium: Raydium = await initSdk()
    const owner = ctx.query.owner;
    let target: PublicKey = owner ? new PublicKey(owner) : raydium.ownerPubKey;
    const amount = await raydium.connection.getBalance(target)
    ctx.body = {
        owner: raydium.ownerPubKey.toString(),
        amount: amount,
        ui_amount: amount / 10 ** 9,
        decimals: 9,
        is_wallet: target.equals(raydium.ownerPubKey)
    }
})

// 获取账户的token balance
router.get('/token_balance', async (ctx) => {
    // console.log(`${}`)
    const raydium: Raydium = await initSdk()
    const owner = ctx.query.owner;
    const mint = ctx.query.mint;
    // console.log(`${owner} ${mint}`)

    if (!owner || !mint) {
        sendErrorResponse(ctx, 501, "miss owner or mint")
        return
    }
    const target = !owner ? raydium.ownerPubKey : new PublicKey(owner);
    const filter = {mint: new PublicKey(mint)};
    ctx.body = await raydium.connection.getTokenAccountsByOwner(target, filter)
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