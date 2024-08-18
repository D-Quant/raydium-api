import Router from "koa-router";
import {initSdk} from "../config";

const axios = require('axios');

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


// 获取池子创世信息
router.get('/create_info/:poolId', async (ctx) => {
    const {poolId} = ctx.params;
    console.log(`poolId: ${poolId}`);
    const url = `https://api-v2.solscan.io/v2/account/balance_change?address=${poolId}&page_size=10&page=1`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
            'Origin': 'https://solscan.io',
            'Sol-Aut': 'vV-MSPRF9yB9dls0fKOj9CCQCPrnQeVmkEZ6Zd6A',
            'Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImluaXRzeXNjdHJsQDE2My5jb20iLCJhY3Rpb24iOiJsb2dnZWQiLCJpYXQiOjE3MjM5ODg4OTksImV4cCI6MTczNDc4ODg5OX0.Wd-yqMhmzKPAlSRCMfdCX7BBemG8sm3h3hut9RdH7aY',
            'Cookie': '_ga=GA1.1.739851789.1710933016; amp_1adb3b=g2bC5oZv0q6-HlwWfGyR72...1hqhs3kku.1hqht1lgu.1j.0.1j; _ga_PS3V7B7KV0=GS1.1.1723986393.121.1.1723991478.0.0.0; cf_clearance=FKh5KqKz3gq.9JhytaMOBbVX9.RnjHQ2sSoQdg2suDM-1723991481-1.2.1.1-idIM0vU0u4fIsLGU8Onyj4RvAxCo69nvuq8ZUQ2KhyGwYYYhtBPbG6Vg1TpMjac4pAMbxGpKk4I8aG0L5buh2Q4mVByo_jgBRGOFP0HokGF.wTPuHevd21NlAp7P5DrV7y8ZWMxd0idJNa3RDT..V2sYCHIBiB225.xLbwDpmoQhUNP60kYUdwUuXU6gUke9JvM876noLUokunn.ZWawsieGrX2VENsabbzlFwiQanBJJQ9impWs4MTUV4UbzStFEBMkRJibdAxgWJhVZxaEFuEaE0vO.3f2wPh38gTztCWnaeFs.zI0mrbIhiG0Yyr71oKl0eohpGCF1kH2LnCuv81DME9sRzW7..Bdj9zPZS8Y6IA2j7OHuIttUPlNpZ_WZIImVXePNtCBYTJvHvY8rXx0y0AjdPUl513VgB93Aco'
        }
    });
    if (response.status == 200) {
        if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const firstElement = response.data.data[0];
            console.log(`firstElement ${firstElement}`)
            ctx.body = firstElement;
        } else {
            ctx.status = 501;
            ctx.body = {error: 'No data available or unexpected response structure'};
        }
    } else {
        console.error('Error fetching data from external API:');
        ctx.status = 502;
        ctx.body = {error: 'Error fetching data from external API'};
    }
});

export default router;

