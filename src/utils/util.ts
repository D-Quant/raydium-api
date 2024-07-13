// 转换函数
import {PublicKey} from "@solana/web3.js";
import {
    AMM_STABLE,
    AMM_V4,
    CLMM_PROGRAM_ID,
    CREATE_CPMM_POOL_PROGRAM,
    DEV_CREATE_CPMM_POOL_PROGRAM,
    DEVNET_PROGRAM_ID,
    TokenAccount
} from '@raydium-io/raydium-sdk-v2'

const AMM_VALID_PROGRAM_ID = new Set([
    AMM_V4.toBase58(),
    AMM_STABLE.toBase58(),
    DEVNET_PROGRAM_ID.AmmV4.toBase58(),
    DEVNET_PROGRAM_ID.AmmStable.toBase58(),
]);

const CLMM_VALID_PROGRAM_ID = new Set([
    CLMM_PROGRAM_ID.toBase58(),
    DEVNET_PROGRAM_ID.CLMM.toBase58()
]);


const CPMM_VALID_PROGRAM_ID = new Set([
    CREATE_CPMM_POOL_PROGRAM.toBase58(),
    DEV_CREATE_CPMM_POOL_PROGRAM.toBase58()
]);

// 判断是不是AMM 池子类型(Stable Pool)
export const isValidAmm = (id: string) => AMM_VALID_PROGRAM_ID.has(id);
// 判断是不是CLMM 池子类型
export const isValidClmm = (id: string) => CLMM_VALID_PROGRAM_ID.has(id);
// 判断是不是CPMM池子类型
export const isValidCpmm = (id: string) => CPMM_VALID_PROGRAM_ID.has(id);


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