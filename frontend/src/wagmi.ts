import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, bsc } from "wagmi/chains";

const config = getDefaultConfig({
  appName: "Fullstack Home Assignment",
  projectId: "YOUR_PROJECT_ID",
  chains: [mainnet, bsc],
  ssr: false,
});

export { config };
