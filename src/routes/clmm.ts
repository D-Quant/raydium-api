import Router from "koa-router";
import {sendErrorResponse} from "../utils/response";
import {initSdk,txVersion} from "../config";
import {
    ApiV3PoolInfoConcentratedItem,
    ClmmKeys,
    ComputeClmmPoolInfo,
    PoolUtils,
    ReturnTypeFetchMultiplePoolTickArrays
} from "@raydium-io/raydium-sdk-v2";
import {isValidClmm} from "../utils/util";
import BN from 'bn.js'

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
    const raydium = await initSdk()
    let poolInfo: ApiV3PoolInfoConcentratedItem
    // RAY-USDC pool
    const poolId = '61R1ndXxvsWXXkWSyNkCxnzwd3zUNB8Q2ibmkiLPC8ht'
    let poolKeys: ClmmKeys | undefined
    let clmmPoolInfo: ComputeClmmPoolInfo
    let tickCache: ReturnTypeFetchMultiplePoolTickArrays

    const inputAmount = new BN(100)

    if (raydium.cluster === 'mainnet') {
        // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
        // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
        const data = await raydium.api.fetchPoolById({ ids: poolId })
        poolInfo = data[0] as ApiV3PoolInfoConcentratedItem
        if (!isValidClmm(poolInfo.programId)) throw new Error('target pool is not CLMM pool')

        clmmPoolInfo = await PoolUtils.fetchComputeClmmInfo({
            connection: raydium.connection,
            poolInfo,
        })
        tickCache = await PoolUtils.fetchMultiplePoolTickArrays({
            connection: raydium.connection,
            poolKeys: [clmmPoolInfo],
        })
    } else {
        const data = await raydium.clmm.getPoolInfoFromRpc(poolId)
        poolInfo = data.poolInfo
        poolKeys = data.poolKeys
        clmmPoolInfo = data.computePoolInfo
        tickCache = data.tickData
    }

    const { minAmountOut, remainingAccounts } = await PoolUtils.computeAmountOutFormat({
        poolInfo: clmmPoolInfo,
        tickArrayCache: tickCache[poolId],
        amountIn: inputAmount,
        tokenOut: poolInfo.mintB,
        slippage: 0.01,
        epochInfo: await raydium.fetchEpochInfo(),
    })

    const { execute,transaction } = await raydium.clmm.swap({
        poolInfo,
        poolKeys,
        inputMint: poolInfo.mintA.address,
        amountIn: inputAmount,
        amountOutMin: minAmountOut.amount.raw,
        observationId: clmmPoolInfo.observationId,
        ownerInfo: {
            useSOLBalance: true,
        },
        remainingAccounts,
        txVersion,


    })


})


export default router;

