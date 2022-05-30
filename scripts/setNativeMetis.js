// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { providers } = require("ethers");
const { ethers } = require("hardhat");

//METIS address for Fantom Opera Mainnet
const METIS = "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000";
//HyperSwap Router for Metis Andromeda Mainnet
const router = "0xd96aeE439e6e5B4f3544bF105eb78F3b8B6CD774";
const zapInPair = "0xc33d8ae2c4f5592b1987e263b2a124cd33e1f624"; // jump metis
const zapInToken = "0xe3c82a836ec85311a433fbd9486efaf4b1afbf48"; // jump
const liveZap = "0xF1D52EEEFF276f6428e4B9e1B7Ee449b7B9d668D";
const netswapPair_address = "0xCC603FE067651e6251E22C8008dB0E47f30D3db2";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Get signers
  const signers = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log("chainId: %s", chainId);

  const [owner] = await ethers.getSigners();
  console.log("owner wallet: %s", owner.address);
  let balance = await ethers.provider.getBalance(owner.address);
  console.log("owner balance: %s METIS", balance / 1e18);

  // UINTMAX for approval
  const UINTMAX = ethers.BigNumber.from(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );
  // deploy
  console.log("\nDeploy zapper");
  const Zap = await ethers.getContractFactory("MetisZap");
  //   const zap = await Zap.deploy();
  const zap = await Zap.attach(liveZap);
  console.log("New zapper address: ", zap.address);
  const useNativeOn = await zap.useNativeRouter(router);
  if (!useNativeOn) {
    console.log("useNativeRouter is off, setting....");
    await zap.setUseNativeRouter(router);
  } else {
    console.log("useNativeRotuer is on!");
  }

  // approves
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
