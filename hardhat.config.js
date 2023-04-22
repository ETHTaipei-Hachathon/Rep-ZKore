require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    gnosis: {
      url: `https://rpc.gnosischain.com`,
      chainId: 100,
      accounts: [process.env.MNEMONIC]
    },
    chiado: {
      url: `https://rpc.chiadochain.net`,
      chainId: 10200,
      accounts: [process.env.MNEMONIC],
      gas: 5_000_000,
      gasPrice: 1_000_000_000
    },
    linea: {
      url: `https://rpc.goerli.linea.build/`,
      accounts: [process.env.MNEMONIC],
    },
    thunderTestnet: {
      url: 'https://testnet-rpc.thundercore.com',
      chainId: 18,
      gas: 90000000,
      gasPrice: 30000000000,
      accounts: [process.env.MNEMONIC]
    }
  }
};
