// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

const Zapper = "0xE54f991d5A427c15Bf08c9a67876a7C108c5686B";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Get signers
  const signers = await ethers.getSigners();
  // UINTMAX for approval
  const UINTMAX = ethers.BigNumber.from(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );
  // Get contract for a given pair
  // Could use Thugswap Pair for BSC, or some other interface
  // Note that this can be used to interact with any LP token (even those that are not from HyperJump/Thughs)
  // As long as the Pair ABI is similar (same function signatures)
  const HyperswapPair = await ethers.getContractAt(
    "HyperSwapPair",
    "0x5448a3b93731e7c1d6e6310cb614843fbac21f69"
  );
  console.log("HyperSwap Pair address: ", HyperswapPair.address);

  console.log("Approving Zapper to spend this LP...");

  //Approve Zapper to use the LP token
  await HyperswapPair.connect(signers[0]).approve(Zapper, UINTMAX);

  console.log("Approval sent to network, check scanner for result");

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
