import {Context} from 'koa';

export function sendErrorResponse(ctx: Context, status: number, message: string) {
    ctx.status = status;
    ctx.body = {
        error: message,
        message: message
    };
}