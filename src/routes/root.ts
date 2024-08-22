import Router from "koa-router";

const router = new Router();
// 获取池子信息 by Raydium Server
router.get('', async (ctx) => {
    ctx.body = {
        'name': 'pump-api',
        'version': 'v1.0.1',
        'author': 'Matrix.Ye',
        'desc': 'api of pump'
    }
})

export default router;
