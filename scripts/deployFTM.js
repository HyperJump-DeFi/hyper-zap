// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

// WFTM address for Fantom Opera Mainnet
const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
// HyperSwap Router for Fantom Opera Mainnet
const router = "0x53c153a0df7E050BbEFbb70eE9632061f12795fB"

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const FantomZap = await ethers.getContractFactory("FantomZap");
  const fantomZap = await FantomZap.deploy(WFTM, router);
  console.log("New zapper address: ", fantomZap.address);
 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
