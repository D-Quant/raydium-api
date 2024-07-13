import Router from "koa-router";
import {initSdk} from "../config";

const router = new Router();

// 获取池子信息 by Raydium Server
router.get('/pool/:poolId', async (ctx) => {
    const raydium = await initSdk();
    const {poolId} = ctx.params;
    console.log(`poolId: ${poolId}`)
    const data = await raydium.api.fetchPoolById({ids: poolId})
    console.log(`pool: ${data}`)
    ctx.body = data;
})
export default router;