require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    matic: {
      url: process.env.QUICKNODE_MUMBAI_POLYGON_RPC_URL,
      accounts: [process.env.POLYGON_PRIVATE_KEY],
      chainId: 80001,
      saveDeployments: true,
    },
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.MUMBAI_POLYGON_API_KEY,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
      },
      {
        version: "0.6.6",
      },
    ],
  },
  contractSizer: {
    runOnCompile: false,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: 200000,
  }
}
}
