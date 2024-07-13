import Router from "koa-router";
import {sendErrorResponse} from "../utils/response";
import {initSdk} from "../config";

const router = new Router();
// 获取CLMM池子的基本信息
router.get('/pool/:poolId', async (ctx) => {
    const raydium = await initSdk()
    const {poolId} = ctx.params;
    if (!poolId) {
        sendErrorResponse(ctx, 400, 'poolId is required');
        return;
    }
    const info = await raydium.clmm.getRpcClmmPoolInfo({poolId: poolId});
    ctx.body = {
        "bump": info.bump,
        "ammConfig": info.ammConfig.toString(),
        "creator": info.creator.toString(),
        "mintA": info.mintA.toString(),
        "mintB": info.mintB.toString(),
        "vaultA": info.vaultA.toString(),
        "vaultB": info.vaultB.toString(),
        "observationId": info.observationId.toString(),
        "mintDecimalsA": info.mintDecimalsA,
        "mintDecimalsB": info.mintDecimalsB,
        "tickSpacing": info.tickSpacing,
        "liquidity": info.liquidity.toString(),
        "sqrtPriceX64": info.sqrtPriceX64.toString(),
        "tickCurrent": info.tickCurrent,
        "observationIndex": info.observationIndex,
        "observationUpdateDuration": info.observationUpdateDuration,
        "feeGrowthGlobalX64A": info.feeGrowthGlobalX64A.toString(),
        "feeGrowthGlobalX64B": info.feeGrowthGlobalX64B.toString(),
        "protocolFeesTokenA": info.protocolFeesTokenA.toString(),
        "protocolFeesTokenB": info.protocolFeesTokenB.toString(),
        "swapInAmountTokenA": info.swapInAmountTokenA.toString(),
        "swapOutAmountTokenB": info.swapOutAmountTokenB.toString(),
        "swapInAmountTokenB": info.swapInAmountTokenB.toString(),
        "swapOutAmountTokenA": info.swapOutAmountTokenA.toString(),
        "status": info.status,
        "totalFeesTokenA": info.totalFeesTokenA.toString(),
        "totalFeesClaimedTokenA": info.totalFeesClaimedTokenA.toString(),
        "totalFeesTokenB": info.totalFeesTokenB.toString(),
        "totalFeesClaimedTokenB": info.totalFeesClaimedTokenB.toString(),
        "fundFeesTokenA": info.fundFeesTokenA.toString(),
        "fundFeesTokenB": info.fundFeesTokenB.toString(),
        "startTime": info.startTime.toNumber(),
        "currentPrice": info.currentPrice,
        "programId": info.programId.toBase58()
    };
});

// 对CLMM池子进行Swap操作
router.post('/swap', async (ctx) => {

})


export default router;

