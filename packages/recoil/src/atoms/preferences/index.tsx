import { atom, selector } from "recoil";
import {
  UI_RPC_METHOD_KEYRING_AUTOLOCK_READ,
  UI_RPC_METHOD_APPROVED_ORIGINS_READ,
  UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
} from "@coral-xyz/common";
import { backgroundClient } from "../client";

export const isDarkMode = atom<boolean | null>({
  key: "isDarkMode",
  default: selector({
    key: "isDarkModeDefault",
    get: async ({ get }) => {
      try {
        const background = get(backgroundClient);
        return await background.request({
          method: UI_RPC_METHOD_SETTINGS_DARK_MODE_READ,
          params: [],
        });
      } catch (e) {
        // An error is thrown on first time wallet onboarding.
        console.error(e);
        return true;
      }
    },
  }),
});

export const autoLockSecs = atom<number | null>({
  key: "autoLockSecs",
  default: selector({
    key: "autoLockSecsDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_KEYRING_AUTOLOCK_READ,
        params: [],
      });
    },
  }),
});

export const approvedOrigins = atom<Array<string> | null>({
  key: "approvedOrigins",
  default: selector({
    key: "approvedOriginsDefault",
    get: async ({ get }) => {
      const background = get(backgroundClient);
      return await background.request({
        method: UI_RPC_METHOD_APPROVED_ORIGINS_READ,
        params: [],
      });
    },
  }),
});