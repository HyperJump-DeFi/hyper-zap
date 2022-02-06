// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

//WBNB address for BSC mainnet
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
//Thugswap Router BSC mainnet
const router = "0x3bc677674df90A9e5D741f28f6CA303357D0E4Ec";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Zap = await ethers.getContractFactory("BSCZap");
  const zap = await Zap.deploy(WBNB, router);
  console.log("New zapper address: ", zap.address);

  //await zap.deployed();
  //console.log("Zapper address: ", zap.address)
  ///
  //const LPVaultHelper = await ethers.getContractFactory("LPVaultWithdrawalHelper")
  //const lpHelper = await LPVaultHelper.deploy()

  //await lpHelper.deployed()
  //console.log("LP Vault Helper address: ", lpHelper.address)

  //const SSVaultHelper = await ethers.getContractFactory("SingleSidedVaultWithdrawHelper")
  //const ssHelper = await SSVaultHelper.deploy()

  //await ssHelper.deployed()
  //console.log("SS Vault Helper address: ", ssHelper.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
