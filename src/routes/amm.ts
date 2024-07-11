import Router from "koa-router";
import {sendErrorResponse} from "../utils/response";
import {initSdk} from "../config";

const router = new Router();


// GET /account/info
router.get('/pool/:poolId', async (ctx) => {
    const {poolId} = ctx.params;
    if (!poolId) {
        sendErrorResponse(ctx, 400, 'User ID is required');
        return;
    }
    const raydium = await initSdk()
    // RAY-SOL
    // const pool1 = 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA'
    // RAY-USDC
    // const pool2 = '6UmmUiYoBjSrhakAobJw8BvkmJtDVxaeBtbt7rxWo1mg'

    const res = await raydium.liquidity.getRpcPoolInfos([poolId])

    // console.log('RAY-SOL pool price:', pool1Info.poolPrice)
    // console.log('RAY-USDC pool price:', pool2Info.poolPrice)
    console.log(`res ${res}`);
    const info = res[0];
    ctx.body = info.status
    // console.log('amm pool infos:', res)
});

// POST /account/update
router.post('/update', async (ctx) => {


});
export default router;