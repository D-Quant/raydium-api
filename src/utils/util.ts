// 转换函数
import {PublicKey} from "@solana/web3.js";
import {AMM_STABLE, AMM_V4, DEVNET_PROGRAM_ID, TokenAccount} from '@raydium-io/raydium-sdk-v2'

const VALID_PROGRAM_ID = new Set([
    AMM_V4.toBase58(),
    AMM_STABLE.toBase58(),
    DEVNET_PROGRAM_ID.AmmV4.toBase58(),
    DEVNET_PROGRAM_ID.AmmStable.toBase58(),
])

export const isValidAmm = (id: string) => VALID_PROGRAM_ID.has(id)

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