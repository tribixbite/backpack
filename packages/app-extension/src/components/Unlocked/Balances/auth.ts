import { PublicKey, Transaction } from "@solana/web3.js";
import { decode, encode } from "bs58";
import { UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION } from "@coral-xyz/common";

export const auth = async (publicKey: string, background: any) => {
  const url = `https://solanauth.backpack.workers.dev/${publicKey}`;
  const requestTransaction = await fetch(url);
  const buffer = Buffer.from(await requestTransaction.text(), "base64");
  const transaction = Transaction.from(buffer);
  const transactionEncoded = encode(buffer);
  const signature = await background.request({
    method: UI_RPC_METHOD_SOLANA_SIGN_TRANSACTION,
    params: [transactionEncoded, publicKey],
  });
  transaction.addSignature(new PublicKey(publicKey), decode(signature) as any);
  const submitSignedTransaction = await fetch(url, {
    method: "POST",
    body: transaction.serialize().toString("base64"),
  });
  console.log(await submitSignedTransaction.text());
};
