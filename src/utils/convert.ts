// 转换函数
import {TokenAccount} from "@raydium-io/raydium-sdk-v2";
import {PublicKey} from "@solana/web3.js";

export function convertData(data: TokenAccount[]): any[] {
    return data.map(item => ({
        publicKey: item.publicKey ? new PublicKey(item.publicKey) : undefined,
        mint: item.mint,
        amount: item.amount.toString(),
        isAssociated: item.isAssociated,
        isNative: item.isNative,
        programId: item.programId
    }));
}