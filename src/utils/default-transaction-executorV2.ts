import {BlockhashWithExpiryBlockHeight, Connection, Transaction, VersionedTransaction,} from '@solana/web3.js';
import bs58 from 'bs58';

export interface TransactionExecutor {
    executeAndConfirm(
        transaction: VersionedTransaction,
        latestBlockHash: BlockhashWithExpiryBlockHeight,
    ): Promise<{ confirmed: boolean; signature?: string, error?: string }>;
}

export class DefaultTransactionExecutorV2 implements TransactionExecutor {
    constructor(private readonly connection: Connection) {
    }

    public async executeAndConfirm(
        transaction: VersionedTransaction,
        latestBlockhash: BlockhashWithExpiryBlockHeight
    ): Promise<{ confirmed: boolean; signature?: string; error?: string }> {

        let txSignature: string;
        let confirmTransactionPromise = null;
        let confirmedTx: {
            confirmed: boolean;
            signature: string;
        } | null = null;

        const signatureRaw = transaction.signatures[0];
        txSignature = bs58.encode(signatureRaw);
        let txSendAttempts = 1;

        try {
            confirmTransactionPromise = this.confirm(txSignature, latestBlockhash);
            await this.execute(transaction);

            while (!confirmedTx) {
                confirmedTx = await Promise.race([
                    confirmTransactionPromise,
                    new Promise<null>((resolve) => setTimeout(resolve, 250)),
                ]);

                if (confirmedTx) {
                    break;
                }

                // console.log(`${new Date().toISOString()} Tx not confirmed after ${250 * txSendAttempts++}ms, resending`);

                await this.execute(transaction);
            }
        } catch (error) {
            console.error(`${new Date().toISOString()} Error sending transaction: ${error}`);
        }

        console.log('confirmedTx', confirmedTx);

        if (!confirmedTx) {
            console.log(`${new Date().toISOString()} Transaction failed`);
            return {confirmed: false, signature: txSignature};
        }

        console.log(`${new Date().toISOString()} Transaction successful`);
        return {confirmed: true, signature: txSignature};
    }

    private async execute(transaction: Transaction | VersionedTransaction) {
        return this.connection.sendRawTransaction(transaction.serialize(), {
            skipPreflight: true,
            preflightCommitment: 'processed',
            maxRetries: 0,
        });
    }

    private async confirm(signature: string, latestBlockhash: BlockhashWithExpiryBlockHeight) {
        const confirmation = await this.connection.confirmTransaction(
            {
                signature,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                blockhash: latestBlockhash.blockhash,
            },
            this.connection.commitment,
        );

        return {confirmed: !confirmation.value.err, signature};
    }
}
