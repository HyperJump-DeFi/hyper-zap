const { providers } = require("ethers");
const { ethers } = require("hardhat");

const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const router = "0x3bc677674df90A9e5D741f28f6CA303357D0E4Ec";
const zapAddress = "0xDFb9F73fb56D5AACeDF0D1D650a3614d21AcfDeB";
// const zapInPair = "0x13F5088D69b0c417C376747a75c57aABD75e9551"; // jump bnb
const zapInToken = "0x130025eE738A66E691E6A7a62381CB33c6d9Ae83"; // jump
const pcsPair = "0xcc4d5f99c6493cf8d4af39b9aa0f2a2eced15934"; // pcs glch bnb
const zapInPair = "0xf2e4e3f9b58b3edac88ad11d689a23f3119a782d"; // busd wbnb hyperjump pair

const UINTMAX = ethers.BigNumber.from(
  "115792089237316195423570985008687907853269984665640564039457584007913129639935"
);

async function main() {
  const signers = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log("\nChainId: %s", chainId);

  const [owner] = await ethers.getSigners();
  console.log("Owner wallet: %s", owner.address);
  const providerX = ethers.provider;
  /*  await network.provider.send("hardhat_setBalance", [
    "0x2E8993d354B64311868E246d17E8e361404eEbcb",
    "0x1000000000000000000000000",
  ]); */
  let balance = await providerX.getBalance(signers[0].address);
  console.log("Owner balance: %s BNB", balance / 1e18);

  console.log("\nAttach zapper");
  const Zap = await ethers.getContractFactory("BSCZap");
  const zap = await Zap.attach(zapAddress);
  console.log("New zapper address: ", zap.address);

  // test native  router
  console.log("\nis native router hyper?");
  const useNativeOn = await zap.useNativeRouter(router);
  if (!useNativeOn) {
    console.log("useNativeRouter is off, setting....");
    await zap.setUseNativeRouter(router);
  } else {
    console.log("useNativeRouter is on!");
  }

  // test zapInToken to wrapped native pairs

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

  // zapInToken
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
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
