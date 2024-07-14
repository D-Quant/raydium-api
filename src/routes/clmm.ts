// noinspection SpellCheckingInspection

import Router from "koa-router";
import {sendErrorResponse} from "../utils/response";
import {executorV2, initSdk, owner, txVersion} from "../config";
import {
    ApiV3PoolInfoConcentratedItem,
    ClmmKeys,
    ComputeClmmPoolInfo,
    MakeTxData,
    PoolUtils,
    ReturnTypeFetchMultiplePoolTickArrays,
    TxV0BuildData
} from "@raydium-io/raydium-sdk-v2";
import {isValidClmm} from "../utils/util";
import BN from 'bn.js'
import Decimal from "decimal.js";

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

// 定义请求体接口
interface ClmmSwapRequest {
    poolId: string;//eg: 58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2
    // inputMint: string;//eg: So11111111111111111111111111111111111111112 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    a2b: boolean;//eg:true: SOL=>USDC , false:USDC=>SOL
    amountIn: number;//eg:500
    slippage: number;//eg: 0.01  range: 1 ~ 0.0001, means 100% ~ 0.01%
    units?: number;//eg: 600000
    microLamports?: number;//eg: 30000
    debug?: boolean;//eg:false
}

// 对CLMM池子进行Swap操作
router.post('/swap', async (ctx) => {
    const raydium = await initSdk()
    const {
        poolId,
        a2b,
        amountIn,
        slippage = 0.01,
        units = 600000,
        microLamports = 30000,
        debug = false
    } = ctx.request.body as ClmmSwapRequest;

    const inputAmount = new BN(amountIn);

    let poolInfo: ApiV3PoolInfoConcentratedItem
    let poolKeys: ClmmKeys | undefined
    let clmmPoolInfo: ComputeClmmPoolInfo
    let tickCache: ReturnTypeFetchMultiplePoolTickArrays


    if (raydium.cluster === 'mainnet') {
        // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
        // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
        const data = await raydium.api.fetchPoolById({ids: poolId})
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

    const {minAmountOut, remainingAccounts} = await PoolUtils.computeAmountOutFormat({
        poolInfo: clmmPoolInfo,
        tickArrayCache: tickCache[poolId],
        amountIn: inputAmount,
        tokenOut: a2b ? poolInfo.mintB : poolInfo.mintA,
        slippage: slippage,
        epochInfo: await raydium.fetchEpochInfo(),
    })
    const [mintIn, mintOut] = a2b ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA]

    const {builder} = await raydium.clmm.swap({
        poolInfo,
        poolKeys,
        inputMint: mintIn.address,
        amountIn: inputAmount,
        amountOutMin: minAmountOut.amount.raw,
        observationId: clmmPoolInfo.observationId,
        ownerInfo: {
            useSOLBalance: true,
        },
        remainingAccounts,
        txVersion,
    })
    // 可能这里需要添加手续费计算相关配置，但sdk并未提供
    builder.addCustomComputeBudget({units: units, microLamports: microLamports});
    const {transaction} = await (builder.versionBuild({txVersion}) as Promise<MakeTxData<TxV0BuildData>>);

    const msg = `computed swap ${new Decimal(amountIn)
        .div(10 ** mintIn.decimals)
        .toDecimalPlaces(mintIn.decimals)
        .toString()} ${mintIn.symbol || mintIn.address} to ${new Decimal(minAmountOut.amount.raw.toString())
        .div(10 ** mintOut.decimals)
        .toDecimalPlaces(mintOut.decimals)
        .toString()} ${mintOut.symbol || mintOut.address}, minimum amount out ${new Decimal(minAmountOut.amount.raw.toString())
        .div(10 ** mintOut.decimals)
        .toDecimalPlaces(mintOut.decimals)} ${mintOut.symbol || mintOut.address}`;

    console.log(msg);
    if (debug) {
        ctx.body = {'debug': debug, 'msg': msg}
        return;
    }
    // publicKey: PublicKey;
    //     secretKey: Uint8Array;
    transaction.sign([owner]);

    const blockHash = await raydium.connection.getLatestBlockhash();
    // console.log(` start: ${new Date().toISOString()}`)
    // const tool = new DefaultTransactionExecutorV2(raydium.connection);
    // console.log(`end: ${new Date().toISOString()}`)
    ctx.body = await executorV2.executeAndConfirm(transaction, blockHash);
})


export default router;

