import { useRecoilValue } from "recoil";
// XXX: this full path is currently necessary as it avoids loading the jsx in
//      react-xnft-renderer/src/Component.tsx in the background service worker
import { Plugin } from "@coral-xyz/react-xnft-renderer/dist/esm/plugin";
import * as atoms from "../../atoms";
import { useXnfts } from "./useXnfts";

export function useAppIcons() {
  const xnftData = useXnfts();
  const pluginData = useRecoilValue(atoms.plugins);
  return xnftData.concat(pluginData);
}

export function usePlugins(): Array<Plugin> {
  const pluginData = useAppIcons();
  return pluginData.map((p) => getPlugin(p));
}

export function getPlugin(p: any): Plugin {
  let plug = PLUGIN_CACHE.get(p.url);
  if (!plug) {
    plug = new Plugin(
      p.url,
      p.iconUrl,
      p.title,
      p.activeWallet,
      p.connectionUrl
    );
    PLUGIN_CACHE.set(p.url, plug);
  }
  return plug;
}

export function allPlugins(): Array<Plugin> {
  return Array.from(PLUGIN_CACHE.values());
}

const PLUGIN_CACHE = new Map<string, Plugin>();