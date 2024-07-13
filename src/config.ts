// noinspection SpellCheckingInspection

import {Raydium, TxVersion} from '@raydium-io/raydium-sdk-v2'
import {Connection, Keypair} from '@solana/web3.js'
import bs58 from 'bs58'
import {DefaultTransactionExecutorV2} from "./utils/default-transaction-executorV2";

const walletSecretKey = process.argv[2];
const rpcUrl = process.argv[3];

if (!walletSecretKey || !rpcUrl) {
    console.log(rpcUrl);
    throw new Error('Usage: ts-node src/index.ts <WALLET_SECRET_KEY> <ENDPOINT_URL>');
}
console.log(`walletSecretKey:${walletSecretKey}`);
console.log(`rpcUrl:${rpcUrl}`);
export const owner: Keypair = Keypair.fromSecretKey(bs58.decode(walletSecretKey))
export const connection = new Connection(rpcUrl) //<ENDPOINT_URL>
export const executorV2 = new DefaultTransactionExecutorV2(connection);
export const txVersion = TxVersion.V0 // or TxVersion.LEGACY
const cluster = 'mainnet' // 'mainnet' | 'devnet'

let raydium: Raydium | undefined
export const initSdk = async (params?: { loadToken?: boolean }) => {
    if (raydium) return raydium
    console.log(`connect to rpc ${connection.rpcEndpoint} in ${cluster}`)
    raydium = await Raydium.load({
        owner,
        connection,
        cluster,
        disableFeatureCheck: true,
        disableLoadToken: !params?.loadToken,
        blockhashCommitment: 'finalized'
    })

    return raydium
}
