import Router from 'koa-router';

const router = new Router();

// GET /account/info
router.get('/info', async (ctx) => {
    ctx.body = {message: 'Account Info'};
});

// 定义请求体接口
interface AccountRequestBody {
    name: string;
    email: string;
}

// POST /account/update
router.post('/update', async (ctx) => {
    const {name, email} = ctx.request.body as AccountRequestBody;

    ctx.body = {message: 'Account updated', data: {name, email}};
});

export default router;