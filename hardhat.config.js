require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@tenderly/hardhat-tenderly");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts")
  .addParam("account", "Address")
  .setAction(async (taskArg) => {
    if (taskArg.account) {
      const b = await ethers.provider.getBalance(taskArg.account);
      console.log(taskArg.account, ": ", ethers.utils.formatUnits(b));
    } else {
      const accounts = await ethers.getSigners();

      for (const account of accounts) {
        const b = await ethers.provider.getBalance(account.address);
        console.log(account.address, ": ", ethers.utils.formatUnits(b));
      }
    }
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      accounts: {
        mnemonic: "",
      },
      gasPrice: "auto",
      gas: 12450000,
    },
    fork: {
      url: "http://127.0.0.1:8545/",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      timeout: 30000,
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: "",
      },
      gasPrice: "auto",
      gas: 12450000,
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    bscMainnet: {
      url: "https://speedy-nodes-nyc.moralis.io/d3ee0268200824bd00a56359/bsc/mainnet/archive",
      chainId: 56,
      gasPrice: "auto",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ftmMainnet: {
      url: process.env.FTM_MAINNET_URL || " https://rpc3.fantom.network",
      chainId: 250,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ftmtestnet: {
      url: "https://rpc.testnet.fantom.network",
      chainId: 0xfa2,
      gasPrice: "auto",
      accounts: {
        mnemonic: "",
        initialIndex: 1,
      },
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.6.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  etherscan: {
    apiKey: "9MIGMDA2VADGXD5DF97XKV5CXH94YY88SR", // process.env.BSCSCAN_API_KEY, // M7N5VQAZF59QIA5CI8W8FHZ8Y8JZ1YKK5H// BSCSCAN"9MIGMDA2VADGXD5DF97XKV5CXH94YY88SR", // FTMscan :"M7N5VQAZF59QIA5CI8W8FHZ8Y8JZ1YKK5H", // process.env.BSCSCAN_API_KEY, // M7N5VQAZF59QIA5CI8W8FHZ8Y8JZ1YKK5H
  },
};
