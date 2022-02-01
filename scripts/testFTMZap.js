// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");

//WFTM address for Fantom Opera Mainnet
const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83"
//HyperSwap Router for Fantom Opera Mainnet
const router = "0x53c153a0df7E050BbEFbb70eE9632061f12795fB"

// 
const zapAddress = "0x8bB58Fe11c81d6B54a07b71052Cc3091cBB7e3CF"
const jumpAddress ="0x78DE9326792ce1d6eCA0c978753c6953Cdeedd73"
const jumpFtmAddress = "0x5448a3B93731e7C1d6e6310Cb614843FbaC21f69"
const UINTMAX = ethers.BigNumber.from("115792089237316195423570985008687907853269984665640564039457584007913129639935");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const FantomZap = await ethers.getContractFactory("FantomZap");
  const fantomZap = await FantomZap.attach(zapAddress);
  console.log("Zapper address: ", fantomZap.address);
  const owner = await fantomZap.owner()
  console.log("zap owner: ", owner)

    //  isFeeOnTransfer
  console.log("isFeeOnTransfer test using JUMP-FTM LP token: ", await fantomZap.isFeeOnTransfer(jumpFtmAddress))

  // estimateZapInToken
  const test1 = await fantomZap.estimateZapInToken(jumpAddress, jumpFtmAddress, "10000")
  console.log("estimateZapInToken 10000 JUMP to JUMP-BNB LP: ", test1.toString() )

  // zapInToken
  console.log("zapInToken JUMP -> JUMP-FTM: ") 
  const JumpToken = await ethers.getContractFactory("HyperJumpToken")
  const jumpToken = await JumpToken.attach(jumpAddress)
  const jumpBalance = await jumpToken.balanceOf(owner)
  //
  console.log(" - Owner JUMP balance: ", jumpBalance.toString())
  const jumpAmountToZap = "1000000" // 1M wei
  //
  console.log("Approving jump for zap... ")
  await jumpToken.approve(fantomZap.address, UINTMAX)
  const jumpAllowance = await jumpToken.allowance(owner, fantomZap.address)
  console.log(" - allowance for jumpToken is: ", jumpAllowance.toString())
  
  //
  const HyperswapPair = await ethers.getContractAt("IHyperswapPair", jumpAddress);
  console.log("HyperSwap Pair address: ", HyperswapPair.address);
  const jumpFTMBalance = await HyperswapPair.balanceOf(owner)
  console.log(" - Owner LP balance: ", jumpFTMBalance.toString())
  console.log("Approving jump LP for zap... ")
  await HyperswapPair.approve(fantomZap.address, UINTMAX)
  const jumpFTMAllowance = await HyperswapPair.allowance(owner, fantomZap.address)
  console.log(" - allowance for jump ftm lp is: ", jumpFTMAllowance.toString())

  const zapInTokenValue =  await fantomZap.zapInToken(jumpAddress, jumpAmountToZap, jumpFtmAddress, owner)
  console.log("zapInToken value: ", zapInTokenValue)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
