import {Context} from 'koa';

export function sendErrorResponse(ctx: Context, status: number, e: any) {
    ctx.status = status;
    let errorMessage: string;
    if (typeof e === "string") {
        errorMessage = e
    } else if (e instanceof Error) {
        errorMessage = e.message; // 通过 message 属性获取错误信息
    } else {
        errorMessage = "unknown error"; // 将其他类型的错误转换为字符串
    }
    ctx.body = {
        error: errorMessage,
    };
}