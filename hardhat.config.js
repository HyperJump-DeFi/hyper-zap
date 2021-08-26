require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@tenderly/hardhat-tenderly");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts")
  .addParam("account", "Address")
  .setAction(async taskArg => {

    if(taskArg.account) {
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
        mnemonic: ''
      },
      gasPrice: "auto",
      gas: 12450000,
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts: {
        mnemonic: ''
      },
      gasPrice: "auto",
      gas: 12450000,
    },
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: "",
        initialIndex: 1,
      }
    },
    bscmainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: "auto",
      accounts: {
        mnemonic: "",
        initialIndex: 1,
      }
    },
    ftmopera: {
      url: "https://rpcapi.fantom.network",
      chainId: 250,
      gasPrice: "auto",
      accounts: {
        mnemonic: "",
        initialIndex: 1,
      }
        //
    },
    ftmtestnet: {
      url: "https://rpc.testnet.fantom.network",
      chainId: 0xfa2,
      gasPrice: "auto",
      accounts: {mnemonic: "",
                 initialIndex: 1,
                }
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.6.0",
        settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
      },
      {
        version: "0.6.12",
        settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
      },
      {
        version: "0.6.2",
        settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
      },
      {
        version: "0.7.6",
        settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
      },
      {
        version: "0.8.0",
        settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
      },
      {
        version: "0.8.4",
        settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
      }
    ]
  },
  etherscan: {
    apiKey: '',
  }
};

