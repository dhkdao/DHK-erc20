import "@nomicfoundation/hardhat-toolbox-viem";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-verify";

import dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });

const alchemyApiKey = process.env.ALCHEMY_API_KEY;
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
let signerKey =
  process.env.DEPLOY_WALLET_PRIVATE_KEY ||
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
signerKey = `0x${signerKey}`;
const create2Salt =
  process.env.CREATE2_SALT ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";


const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    anvil: {
      url: "http://localhost:8545",
      chainId: 31337,
      accounts: [signerKey],
      gasMultiplier: 2,
    },
    base: {
      chainId: 8453,
      url: `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [signerKey],
    },
    baseSepolia: {
      chainId: 84532,
      url: `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [signerKey],
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify.dev/server",
    browserUrl: "https://repo.sourcify.dev",
  },
  ignition: {
    strategyConfig: {
      create2: {
        salt: create2Salt,
      },
    },
  },
};

export default config;
