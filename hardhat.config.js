// require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: {
  //   compilers: [
  //     {
  //       version: "0.7.6",
  //       settings: {
  //         evmVersion: "istanbul",
  //         optimizer: {
  //           enabled: true,
  //           runs: 1000,
  //         },
  //       },
  //     },
  //   ],
  // },
  solidity:"0.7.6",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.g.alchemy.com/v2/VCnDB0hmjFoGHllfkZN1Irz4tVq8iMmy",
      },
    },
  },
};

// require("@nomiclabs/hardhat-waffle");

// module.exports = {
//   solidity: {
//     version: "0.7.6",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 5000,
//         details: { yul: false },
//       },
//     },
//   },
//   networks: {
//     hardhat: {
//       forking: {
//         url: "your",
//         accounts: [`0x${"your"}`],
//       },
//     },
//   },
// };
