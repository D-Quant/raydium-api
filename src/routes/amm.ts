import Router from "koa-router";
import {sendErrorResponse} from "../utils/response";
import {initSdk} from "../config";

const router = new Router();


// 获取AMM池的基本信息
router.get('/pool/:poolId', async (ctx) => {

    const {poolId} = ctx.params;
    if (!poolId) {
        sendErrorResponse(ctx, 400, 'User ID is required');
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
        "poolPrice": res.poolPrice
    }
});

// POST /account/update
router.post('/update', async (ctx) => {


});
export default router;