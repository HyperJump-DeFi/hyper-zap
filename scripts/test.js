// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { providers } = require("ethers");
const { ethers } = require("hardhat");

//WFTM address for Fantom Opera Mainnet
const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
//HyperSwap Router for Fantom Opera Mainnet
const router = "0x53c153a0df7E050BbEFbb70eE9632061f12795fB";
const zapInPair = "0x5448a3b93731e7c1d6e6310cb614843fbac21f69"; // jump ftm
const zapInToken = "0x78DE9326792ce1d6eCA0c978753c6953Cdeedd73"; // jump
const liveZap = "0x61D791390ed5067E43BBd9760d26Ed2E57d24523";
const spiritPair = "0xe7e90f5a767406eff87fdad7eb07ef407922ec1d";

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
  console.log("owner balance: %s FTM", balance / 1e18);
  // UINTMAX for approval
  const UINTMAX = ethers.BigNumber.from(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );
  // deploy
  console.log("\nDeploy zapper");
  const Zap = await ethers.getContractFactory("FTMZap");
  //const zap = await Zap.deploy(WFTM);
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

  // Approve Zapper to use the LP token
  const HyperswapPair = await ethers.getContractAt("IHyperswapPair", zapInPair);
  console.log("\nHyperSwap Pair address: ", HyperswapPair.address);
  const token0 = await HyperswapPair.token0();
  const token1 = await HyperswapPair.token1();
  console.log(
    "HyperSwap Pair tokens addresses: ",
    token0,
    token1,
    token0 == zapInToken || token1 == zapInToken
  );
  console.log("Approving Zapper to spend this LP...");
  await HyperswapPair.connect(signers[0]).approve(zap.address, UINTMAX);

  // Approve Zapper to use the in token
  const InToken = await ethers.getContractAt("IHyperswapPair", zapInToken);
  console.log("Approving Zapper to spend this token...");
  await InToken.connect(signers[0]).approve(zap.address, UINTMAX);

  // zapIn
  console.log("\nzapInToken", signers[0].address);
  await zap.zapInToken(
    zapInToken,
    "1000000000000000000",
    zapInPair,
    router,
    signers[0].address
  );

  console.log("zapped...");

  // owner lp balance
  const ownerBalance = await HyperswapPair.balanceOf(signers[0].address);
  console.log("owner lp balance: ", ownerBalance.toString());

  // zapOutToken
  console.log("\nzapOutToken", signers[0].address);
  await zap.zapOutToken(
    zapInPair,
    ownerBalance,
    zapInToken,
    router,
    signers[0].address
  );

  console.log("zapped...");

  // zapIn
  console.log("\nzapIn", owner.address);
  const options = { value: ethers.utils.parseEther("1.0") };
  await zap.zapIn(zapInPair, router, owner.address, options);
  console.log("zapped in...");

  // zapOUT
  console.log("\nzapOut");
  let ownerZapOutBal = await HyperswapPair.balanceOf(signers[0].address);
  console.log("owner pair bal", ownerZapOutBal.toString());

  const receipt = await zap.zapOut(
    zapInPair,
    ownerZapOutBal,
    router,
    owner.address
  );
  console.log("zapped out...");
  ownerZapOutBal = await HyperswapPair.balanceOf(signers[0].address);
  console.log("owner pair bal", ownerZapOutBal.toString());

  // zapAcross
  console.log("\nzapAcross");
  const SpiritPair = await ethers.getContractAt("IHyperswapPair", spiritPair);
  let balSpiritPair = await SpiritPair.balanceOf(signers[0].address);
  console.log("spiritpair bal ", balSpiritPair.toString());
  console.log("Approving Zapper to spend this LP...");
  await SpiritPair.connect(signers[0]).approve(zap.address, UINTMAX);
  if (balSpiritPair.toString() > 0) {
    await zap.zapAcross(spiritPair, balSpiritPair, router, owner.address);
  }
  balSpiritPair = await SpiritPair.balanceOf(signers[0].address);
  console.log("spiritpair bal ", balSpiritPair.toString());
  console.log("zappedAccreosososo");

  // estimateZapInToken
  console.log("\nestimateZapInToken");
  let inBal1 = await InToken.balanceOf(signers[0].address);
  const res = await zap.estimateZapInToken(
    zapInToken,
    zapInPair,
    router,
    inBal1
  );

  console.log("response estimate zap", res[0], res[1]);

  // swapToken
  console.log("\nswapToken");
  inBal1 = await InToken.balanceOf(signers[0].address);
  await zap.swapToken(
    zapInToken,
    ethers.utils.parseEther("1.0"),
    WFTM,
    router,
    owner.address
  );
  const inBal2 = await InToken.balanceOf(signers[0].address);
  console.log(
    "swapToken complete",
    inBal1 / 1e18,
    inBal2 / 1e18,
    (inBal1 - inBal2) / 1e18
  );

  // swapToNative
  console.log("\nswapToNative");
  const inBal11 = await InToken.balanceOf(signers[0].address);
  await zap.swapToNative(
    zapInToken,
    ethers.utils.parseEther("10.0"),
    router,
    owner.address
  );
  const inBal22 = await InToken.balanceOf(signers[0].address);
  console.log(
    "swapToken complete",
    inBal11 / 1e18,
    inBal22 / 1e18,
    (inBal11 - inBal22) / 1e18
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
