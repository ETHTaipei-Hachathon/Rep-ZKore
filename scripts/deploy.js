// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const ZKore = await hre.ethers.getContractFactory("ZKore");
  const zkore = await ZKore.deploy("0xAd549A3c14feB8b5a0cB40b37D00312c07Ac55D5");

  await zkore.deployed();

  console.log(`ZKore deployed to ${zkore.address}`);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
