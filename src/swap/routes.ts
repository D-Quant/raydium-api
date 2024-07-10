import Router from 'koa-router';

const router = new Router();
// 定义请求体接口
interface SwapRequestBody {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
}

// GET /swap/status
router.get('/status', async (ctx) => {
    ctx.body = {message: 'Swap Status'};
});

// POST /swap/execute
router.post('/execute', async (ctx) => {
    const { fromCurrency, toCurrency, amount } = ctx.request.body as SwapRequestBody;
    ctx.body = { message: 'Swap executed', data: { fromCurrency, toCurrency, amount } };
});


export default router;