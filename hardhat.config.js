require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.7.6",
        settings: {
          evmVersion: "istanbul",
          optimizer: {
            runs: 200,
            enabled: true,
            details: {
              yul: true,
            },
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/VCnDB0hmjFoGHllfkZN1Irz4tVq8iMmy",
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      gasPrice: "auto",
      gasMultiplier: 1.2,
    },
  },
  mocha: {
    timeout: 100000,
  },
};