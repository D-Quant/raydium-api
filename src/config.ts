// noinspection SpellCheckingInspection

import {Raydium, TxVersion} from '@raydium-io/raydium-sdk-v2'
import {Connection, Keypair} from '@solana/web3.js'
import bs58 from 'bs58'

export const owner: Keypair = Keypair.fromSecretKey(bs58.decode('<YOUR_WALLET_SECRET_KEY>'))
export const connection = new Connection('<YOUR_RPC_URL>') //<YOUR_RPC_URL>

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
        // urlConfigs: {
        //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
        // },
    })

    return raydium
}