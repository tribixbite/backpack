import { useActiveSolanaWallet, useBackgroundClient } from "@coral-xyz/recoil";
import { Box } from "@mui/material";
import { useEffect } from "react";
import {
  Header,
  HeaderIcon,
  PrimaryButton,
  SubtextParagraph,
} from "../../../../common";
import { HardwareWalletIcon } from "../../../../common/Icon";
import { auth } from "../../../Balances/auth";

export function ConnectHardwareWelcome({ onNext }: { onNext: () => void }) {
  const background = useBackgroundClient();
  const { publicKey } = useActiveSolanaWallet();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ margin: "0 24px" }}>
        <HeaderIcon icon={<HardwareWalletIcon />} />
        <Header text="Connect a hardware wallet" />
        <SubtextParagraph>
          Use your hardware wallet with Backpack.
        </SubtextParagraph>
      </Box>
      <Box
        sx={{
          marginLeft: "16px",
          marginRight: "16px",
          marginBottom: "16px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <PrimaryButton
          label="Next"
          onClick={() => auth(publicKey, background)}
        />
      </Box>
    </Box>
  );
}
