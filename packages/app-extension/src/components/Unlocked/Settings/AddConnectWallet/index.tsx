import { useEffect, useState } from "react";
import type { Blockchain } from "@coral-xyz/common";
import {
  openAddUserAccount,
  openConnectHardware,
  TAB_APPS,
  TAB_BALANCES,
  UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
  UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
} from "@coral-xyz/common";
import {
  CheckIcon,
  HardwareWalletIcon,
  PrimaryButton,
  ProxyImage,
  SecondaryButton,
} from "@coral-xyz/react-common";
import {
  useAvatarUrl,
  useBackgroundClient,
  useKeyringType,
  useTab,
  useUser,
  useWalletName,
} from "@coral-xyz/recoil";
import { useCustomTheme } from "@coral-xyz/themes";
import { AddCircle, ArrowCircleDown } from "@mui/icons-material";
import { Box, Grid, Typography } from "@mui/material";

import { Header, SubtextParagraph } from "../../../common";
import { ActionCard } from "../../../common/Layout/ActionCard";
import {
  useDrawerContext,
  WithMiniDrawer,
} from "../../../common/Layout/Drawer";
import { useNavStack } from "../../../common/Layout/NavStack";
import { WalletListItem } from "../YourAccount/EditWallets";

export function AddConnectPreview({ blockchain }: { blockchain: Blockchain }) {
  const nav = useNavStack();
  const user = useUser();
  const avatarUrl = useAvatarUrl(72, user.username);
  const theme = useCustomTheme();
  const { close } = useDrawerContext();

  useEffect(() => {
    nav.setTitle("");
  }, [nav]);

  return (
    <div
      style={{
        height: "100%",
        justifyContent: "space-between",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <div>
        <ProxyImage
          src={avatarUrl}
          style={{
            marginBottom: "16px",
            marginTop: "8px",
            width: "72px",
            borderRadius: "36px",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
          }}
        />
        <Typography
          style={{
            color: theme.custom.colors.fontColor,
            fontSize: "24px",
            fontWeight: 500,
            textAlign: "center",
            marginLeft: "32px",
            marginRight: "32px",
          }}
        >
          Your new wallet will be associated with @{user.username}
        </Typography>
        <Typography
          style={{
            marginLeft: "32px",
            marginRight: "32px",
            marginTop: "8px",
            fontSize: "16px",
            fontWeight: 500,
            color: theme.custom.colors.secondary,
            textAlign: "center",
          }}
        >
          This connection will be public, so if you'd prefer to create a
          separate wallet, create a new user.
        </Typography>
      </div>
      <div
        style={{
          marginLeft: "16px",
          marginRight: "16px",
        }}
      >
        <PrimaryButton
          label={`Continue as @${user.username}`}
          onClick={() => nav.push("add-connect-wallet")}
        />
        <SecondaryButton
          label={`Create a new user`}
          style={{
            marginTop: "16px",
            marginBottom: "16px",
            backgroundColor: "transparent",
          }}
          onClick={() => {
            close();
            openAddUserAccount();
          }}
        />
      </div>
    </div>
  );
}

export function AddConnectWalletMenu({
  blockchain,
}: {
  blockchain: Blockchain;
}) {
  const nav = useNavStack();
  const background = useBackgroundClient();
  const keyringType = useKeyringType();
  const theme = useCustomTheme();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [newPublicKey, setNewPublicKey] = useState("");

  // Lock to ensure that the create new wallet button cannot be accidentally
  // spammed or double clicked, which is undesireable as it creates more wallets
  // than the user expects.
  const [lockCreateButton, setLockCreateButton] = useState(false);

  useEffect(() => {
    const prevTitle = nav.title;
    nav.setTitle("");
    return () => {
      nav.setTitle(prevTitle);
    };
  }, [nav.setContentStyle]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ margin: "24px" }}>
          <Header text="Add or connect a wallet" />
          <SubtextParagraph>
            Add a new wallet associated with your user.
          </SubtextParagraph>
        </Box>
        <Box sx={{ margin: "0 16px" }}>
          <Grid container spacing={2}>
            {keyringType === "mnemonic" && (
              <Grid item xs={6}>
                <ActionCard
                  icon={
                    <AddCircle
                      style={{
                        color: theme.custom.colors.icon,
                      }}
                    />
                  }
                  text="Create a new wallet"
                  onClick={async () => {
                    if (lockCreateButton) {
                      return;
                    }
                    setLockCreateButton(true);
                    const publicKey = await background.request({
                      method: UI_RPC_METHOD_KEYRING_DERIVE_WALLET,
                      params: [blockchain],
                    });
                    setNewPublicKey(publicKey);
                    setOpenDrawer(true);
                    setLockCreateButton(false);
                  }}
                />
              </Grid>
            )}
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <ArrowCircleDown
                    style={{
                      color: theme.custom.colors.icon,
                    }}
                  />
                }
                text="Import a private key"
                onClick={() => nav.push("import-secret-key", { blockchain })}
              />
            </Grid>
            <Grid item xs={6}>
              <ActionCard
                icon={
                  <HardwareWalletIcon
                    fill={theme.custom.colors.icon}
                    style={{
                      width: "24px",
                      height: "24px",
                    }}
                  />
                }
                text="Import from hardware wallet"
                onClick={() => {
                  openConnectHardware(blockchain);
                  window.close();
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </div>
      <WithMiniDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        backdropProps={{
          style: {
            opacity: 0.8,
            background: "#18181b",
          },
        }}
      >
        <ConfirmCreateWallet
          blockchain={blockchain}
          publicKey={newPublicKey}
          setOpenDrawer={setOpenDrawer}
        />
      </WithMiniDrawer>
    </>
  );
}

export const ConfirmCreateWallet: React.FC<{
  blockchain: Blockchain;
  publicKey: string;
  setOpenDrawer: (b: boolean) => void;
}> = ({ blockchain, publicKey, setOpenDrawer }) => {
  const theme = useCustomTheme();
  const walletName = useWalletName(publicKey);
  const background = useBackgroundClient();
  const tab = useTab();
  const { close } = useDrawerContext();
  return (
    <div
      style={{
        height: "232px",
        backgroundColor: theme.custom.colors.bg2,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Typography
          style={{
            marginTop: "16px",
            textAlign: "center",
            fontWeight: 500,
            fontSize: "18px",
            lineHeight: "24px",
            color: theme.custom.colors.fontColor,
          }}
        >
          Wallet Created
        </Typography>
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          <CheckIcon />
        </div>
      </div>
      <div>
        <WalletListItem
          blockchain={blockchain}
          name={walletName}
          publicKey={publicKey}
          showDetailMenu={false}
          isFirst={true}
          isLast={true}
          onClick={() => {
            if (tab === TAB_BALANCES) {
              // Experience won't go back to TAB_BALANCES so we poke it
              background.request({
                method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
                params: [TAB_APPS],
              });
            }

            background.request({
              method: UI_RPC_METHOD_NAVIGATION_ACTIVE_TAB_UPDATE,
              params: [TAB_BALANCES],
            });

            // Close mini drawer.
            setOpenDrawer(false);
            // Close main drawer.
            close();
          }}
        />
      </div>
    </div>
  );
};
