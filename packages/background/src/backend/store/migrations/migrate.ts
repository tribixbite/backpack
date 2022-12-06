import {
  setKeyringStore,
  getKeyringCiphertext,
  KeyringStoreJson,
} from "../keyring";
import { setWalletDataForUser, getWalletData_DEPRECATED } from "../preferences";
import * as crypto from "../../keyring/crypto";

// Migration: 0.2.0-latest-beta-510.
export async function migrate_0_2_0_510(
  uuid: string,
  username: string,
  password: string
) {
  await migrateKeyringStore_0_2_0_510(uuid, username, password);
  await migrateWalletData_0_2_0_510(uuid);
}

async function migrateWalletData_0_2_0_510(uuid: string) {
  const walletData = await getWalletData_DEPRECATED();
  await setWalletDataForUser(uuid, walletData);
}

export async function migrateKeyringStore_0_2_0_510(
  uuid: string,
  username: string,
  password: string
) {
  const ciphertextPayload = await getKeyringCiphertext();
  if (ciphertextPayload === undefined || ciphertextPayload === null) {
    throw new Error("keyring store not found on disk");
  }
  const plaintext = await crypto.decrypt(ciphertextPayload, password);
  const json = JSON.parse(plaintext);

  if (json.username) {
    throw new Error("invalid keyring format");
  }

  const walletData = await getWalletData_DEPRECATED();

  // @ts-ignore
  if (walletData.username !== username) {
    throw new Error("unexpected username");
  }

  const { mnemonic, blockchains, lastUsedTs } = json;

  const newJson: KeyringStoreJson = {
    activeUserUuid: uuid,
    users: Object.fromEntries([
      [
        uuid,
        {
          uuid,
          username,
          mnemonic,
          blockchains,
        },
      ],
    ]),
    lastUsedTs,
  };

  await setKeyringStore(newJson, password);
}
