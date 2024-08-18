// noinspection SpellCheckingInspection

import Router from 'koa-router';
import {sendErrorResponse} from '../utils/response';
import {initSdk} from '../config'
import {parseTokenAccountResp, Raydium} from "@raydium-io/raydium-sdk-v2";
import {PublicKey} from "@solana/web3.js"
import {TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID} from '@solana/spl-token'
import {convertData} from "../utils/util";

const router = new Router();


// 获取当前钱包的地址
router.get('/mywallet', async (ctx) => {
    const raydium: Raydium = await initSdk()
    const pubkey = raydium.ownerPubKey.toString()
    ctx.body = {owner: pubkey}
})
// 获取账户的sol余额
router.get('/balance', async (ctx) => {
    const raydium: Raydium = await initSdk()
    const owner = ctx.query.owner;
    let target: PublicKey = owner ? new PublicKey(owner) : raydium.ownerPubKey;
    const amount = await raydium.connection.getBalance(target)
    ctx.body = {
        owner: raydium.ownerPubKey.toString(),
        amount: amount,
        uiAmount: amount / 10 ** 9,
        decimals: 9,
        isWallet: target.equals(raydium.ownerPubKey)
    }
})

// 获取账户的token balance
router.get('/token_balance', async (ctx) => {
    const raydium: Raydium = await initSdk()
    const owner = ctx.query.owner;
    const mint = ctx.query.mint;
    if (!mint) {
        sendErrorResponse(ctx, 501, "miss owner or mint")
        return
    }
    try {
        const target: PublicKey = !owner ? raydium.ownerPubKey : new PublicKey(owner);
        const filter = {mint: new PublicKey(mint)};
        let acc = await raydium.connection.getParsedTokenAccountsByOwner(target, filter);
        if (acc.value.length === 0) {
            ctx.body = {
                "isNative": false,
                "mint": mint,
                "owner": target.toString(),
                "state": "initialized",
                "tokenAmount": null
            }
            return;
        }
        let tokenAccountParsed = acc.value[0];
        ctx.body = tokenAccountParsed.account.data.parsed.info;
    } catch (e) {
        sendErrorResponse(ctx, 500, e)
    }
})

// 获取用户的全部资产数据
router.get('/asset', async (ctx) => {
    try {
        const owner = ctx.query.owner;
        const raydium: Raydium = await initSdk()
        const target = owner ? new PublicKey(owner) : raydium.ownerPubKey
        const solAccountResp = await raydium.connection.getAccountInfo(target)
        const tokenAccountResp = await raydium.connection.getTokenAccountsByOwner(target, {programId: TOKEN_PROGRAM_ID})
        const token2022Req = await raydium.connection.getTokenAccountsByOwner(target, {programId: TOKEN_2022_PROGRAM_ID})
        const tokenAccountData = parseTokenAccountResp({
            owner: target,
            solAccountResp,
            tokenAccountResp: {
                context: tokenAccountResp.context,
                value: [...tokenAccountResp.value, ...token2022Req.value],
            },
        })
        ctx.body = convertData(tokenAccountData.tokenAccounts);
    } catch (e) {
        sendErrorResponse(ctx, 500, e);
    }
})



export default router;
