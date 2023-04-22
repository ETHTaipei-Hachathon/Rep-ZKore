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
      gas: 500000,
      gasPrice: 1000000000
    },
    linea: {
      url: `https://rpc.goerli.linea.build/`,
      accounts: [process.env.MNEMONIC],
    },
  }
};
