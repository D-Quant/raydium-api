// noinspection SpellCheckingInspection

import Router from "koa-router";
import {sendErrorResponse} from "../utils/response";
import {executorV2, initSdk, owner, txVersion} from "../config";
import {AmmRpcData, AmmV4Keys, ApiV3PoolInfoStandardItem} from "@raydium-io/raydium-sdk-v2";
import {isValidAmm} from "../utils/util";
import BN from "bn.js";
import Decimal from "decimal.js";

const router = new Router();


//GET 获取AMM池的基本信息
router.get('/pool/:poolId', async (ctx) => {

    const {poolId} = ctx.params;
    if (!poolId) {
        sendErrorResponse(ctx, 400, 'AMM poolId is required');
        return;
    }
    const raydium = await initSdk()
    console.log(`poolId: ${poolId}`)
    const res = await raydium.liquidity.getRpcPoolInfo(poolId);
    console.log(`res ${res}`);
    ctx.body = {
        "status": res.status.toNumber(),
        "nonce": res.nonce.toNumber(),
        "maxOrder": res.maxOrder.toNumber(),
        "depth": res.depth.toNumber(),
        "baseDecimal": res.baseDecimal.toNumber(),
        "quoteDecimal": res.quoteDecimal.toNumber(),
        "state": res.state.toNumber(),
        "resetFlag": res.resetFlag.toNumber(),
        "minSize": res.minSize.toString(),
        "volMaxCutRatio": res.volMaxCutRatio.toString(),
        "amountWaveRatio": res.amountWaveRatio.toString(),
        "baseLotSize": res.baseLotSize.toString(),
        "quoteLotSize": res.quoteLotSize.toString(),
        "minPriceMultiplier": res.minPriceMultiplier.toString(),
        "maxPriceMultiplier": res.maxPriceMultiplier.toString(),
        "systemDecimalValue": res.systemDecimalValue.toString(),
        "minSeparateNumerator": res.minSeparateNumerator.toString(),
        "minSeparateDenominator": res.minSeparateDenominator.toString(),
        "tradeFeeNumerator": res.tradeFeeNumerator.toString(),
        "tradeFeeDenominator": res.tradeFeeDenominator.toString(),
        "pnlNumerator": res.pnlNumerator.toString(),
        "pnlDenominator": res.pnlDenominator.toString(),
        "swapFeeNumerator": res.swapFeeNumerator.toString(),
        "swapFeeDenominator": res.swapFeeDenominator.toString(),
        "baseNeedTakePnl": res.baseNeedTakePnl.toString(),
        "quoteNeedTakePnl": res.quoteNeedTakePnl.toString(),
        "quoteTotalPnl": res.quoteTotalPnl.toString(),
        "baseTotalPnl": res.baseTotalPnl.toString(),
        "poolOpenTime": res.poolOpenTime.toNumber(),
        "punishPcAmount": res.punishPcAmount.toString(),
        "punishCoinAmount": res.punishCoinAmount.toString(),
        "orderbookToInitTime": res.orderbookToInitTime.toNumber(),
        "swapBaseInAmount": res.swapBaseInAmount.toString(),
        "swapQuoteOutAmount": res.swapQuoteOutAmount.toString(),
        "swapBase2QuoteFee": res.swapBase2QuoteFee.toString(),
        "swapQuoteInAmount": res.swapQuoteInAmount.toString(),
        "swapBaseOutAmount": res.swapBaseOutAmount.toString(),
        "swapQuote2BaseFee": res.swapQuote2BaseFee.toString(),
        "baseVault": res.baseVault.toString(),
        "quoteVault": res.quoteVault.toString(),
        "baseMint": res.baseMint.toString(),
        "quoteMint": res.quoteMint.toString(),
        "lpMint": res.lpMint.toString(),
        "openOrders": res.openOrders.toString(),
        "marketId": res.marketId.toString(),
        "marketProgramId": res.marketProgramId.toString(),
        "targetOrders": res.targetOrders.toString(),
        "withdrawQueue": res.withdrawQueue.toString(),
        "lpVault": res.lpVault.toString(),
        "owner": res.owner.toString(),
        "lpReserve": res.lpReserve.toString(),
        "padding": res.padding.toString(),
        "programId": res.programId.toString(),
        "baseReserve": res.baseReserve.toString(),
        "mintAAmount": res.mintAAmount.toString(),
        "mintBAmount": res.mintBAmount.toString(),
        "quoteReserve": res.quoteReserve.toString(),
        "poolPrice": res.poolPrice.toString()
    }
});

// 定义请求体接口
interface AmmSwapRequest {
    poolId: string;//eg: 58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2
    // inputMint: string;//eg: So11111111111111111111111111111111111111112 EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    a2b: boolean;//eg:true: SOL=>USDC , false:USDC=>SOL
    amountIn: number;//eg:500
    slippage: number;//eg: 0.01  range: 1 ~ 0.0001, means 100% ~ 0.01%
    units?: number;//eg: 600000
    microLamports?: number;//eg: 30000
    debug?: boolean;//eg:false
}

// POST AMM Swap
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
    } = ctx.request.body as AmmSwapRequest;

    if (!poolId || !amountIn) {
        sendErrorResponse(ctx, 400, 'Invalid request body,miss Args');
        return;
    }

    let poolInfo: ApiV3PoolInfoStandardItem | undefined;
    let poolKeys: AmmV4Keys | undefined;
    let rpcData: AmmRpcData;


    // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
    // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
    if (raydium.cluster === 'mainnet') {
        const data = await raydium.api.fetchPoolById({ids: poolId})
        poolInfo = data[0] as ApiV3PoolInfoStandardItem
        if (!isValidAmm(poolInfo.programId)) throw new Error('target pool is not AMM pool')
        poolKeys = await raydium.liquidity.getAmmPoolKeys(poolId)
        rpcData = await raydium.liquidity.getRpcPoolInfo(poolId)
    } else {
        // note: getPoolInfoFromRpc method only return required pool data for computing not all detail pool info
        const data = await raydium.liquidity.getPoolInfoFromRpc({poolId})
        poolInfo = data.poolInfo
        poolKeys = data.poolKeys
        rpcData = data.poolRpcData
    }
    const [baseReserve, quoteReserve, status] = [rpcData.baseReserve, rpcData.quoteReserve, rpcData.status.toNumber()]


    const [mintIn, mintOut] = a2b ? [poolInfo.mintA, poolInfo.mintB] : [poolInfo.mintB, poolInfo.mintA]

    const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
            ...poolInfo,
            baseReserve,
            quoteReserve,
            status,
            version: 4,
        },
        amountIn: new BN(amountIn),
        mintIn: mintIn.address,
        mintOut: mintOut.address,
        slippage: slippage, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    })
    const msg = `computed swap ${new Decimal(amountIn)
        .div(10 ** mintIn.decimals)
        .toDecimalPlaces(mintIn.decimals)
        .toString()} ${mintIn.symbol || mintIn.address} to ${new Decimal(out.amountOut.toString())
        .div(10 ** mintOut.decimals)
        .toDecimalPlaces(mintOut.decimals)
        .toString()} ${mintOut.symbol || mintOut.address}, minimum amount out ${new Decimal(out.minAmountOut.toString())
        .div(10 ** mintOut.decimals)
        .toDecimalPlaces(mintOut.decimals)} ${mintOut.symbol || mintOut.address}`;
    console.log(msg);
    if (debug) {
        ctx.body = {'debug': debug, 'msg': msg}
        return;
    }

    const {transaction} = await raydium.liquidity.swap({
        poolInfo,
        poolKeys,
        amountIn: new BN(amountIn),
        amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
        fixedSide: 'in',
        inputMint: mintIn.address,
        txVersion,

        // optional: set up priority fee here
        computeBudgetConfig: {
            units: units,
            // microLamports: 0, 8 ,0.5
            // microLamports: 13646642, 0.8 ,4
            // microLamports: 1364664, 0.075 ,2
            // microLamports: 300000, 0.025951 ,2
            // microLamports: 30000, 0.003 ,9
            microLamports: microLamports,//0.003 ,9
        },
    })

    transaction.sign([owner]);
    // console.log(`tx ${t}`)
    // console.log(` start: ${new Date().toISOString()}`)
    // const tool = new DefaultTransactionExecutorV2(raydium.connection);
    // console.log(`end: ${new Date().toISOString()}`)
    const blockHash = await raydium.connection.getLatestBlockhash();
    ctx.body = await executorV2.executeAndConfirm(transaction, blockHash);


});


export default router;