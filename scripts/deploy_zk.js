// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { poseidonContract} =  require("circomlibjs")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const networkName = hre.network.name

async function main() {
    
    // Set deployer 
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Incremental merkletree deploy 
    const poseidonT3ABI = poseidonContract.generateABI(2)
    const poseidonT3Bytecode = poseidonContract.createCode(2)

    
    const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, deployer)
    const poseidonT3Lib = await PoseidonLibT3Factory.deploy()

    await poseidonT3Lib.deployed()

    console.log(`PoseidonT3 library has been deployed to: ${poseidonT3Lib.address}`)

    const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
        libraries: {
            PoseidonT3: poseidonT3Lib.address
        }
    })
    const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()
    await incrementalBinaryTreeLib.deployed()
    console.log(`IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTreeLib.address}`)

    // Verifier deploy 
    const verifier16 = await ethers.getContractFactory("Verifier16")
    const verifier = await verifier16.deploy()
    console.log(`Verifier contract has been deployed to: ${verifier.address}`)
    
    // Semaphore deploy 
    const Semaphore = await ethers.getContractFactory("Semaphore", {
      libraries: {
          IncrementalBinaryTree: incrementalBinaryTreeLib.address
      }
    })
    const semaphore = await Semaphore.deploy("16",verifier.address)
    console.log(`Semaphore contract has been deployed to: ${semaphore.address}`)

    // contract address
    const contract_addresses = {
      "Semaphore": {
          "address": semaphore.address
      },
      "Verifier": {
          "address": verifier.address
      }
}

    // Create four certificate of semaphore group
    const transaction_group1 = await semaphore.connect(deployer).createGroup(1, 16, BigInt(1), deployer.address)
    await transaction_group1.wait()
    console.log(`Group S has created`)

    const transaction_group2 = await semaphore.connect(deployer).createGroup(2, 16, BigInt(1), deployer.address)
    await transaction_group2.wait()
    console.log(`Group A has created`)

   
    const transaction_group3 = await semaphore.connect(deployer).createGroup(3, 16, BigInt(1), deployer.address)
    await transaction_group3.wait()
    console.log(`Group B has created`)

    const transaction_group4 = await semaphore.connect(deployer).createGroup(4, 16, BigInt(1), deployer.address)
    await transaction_group4.wait()
    console.log(`Group C has created`)

  saveconfigaddress(contract_addresses);
}

function saveconfigaddress(contract_addresses) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../document";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${networkName}_config.json`,
    JSON.stringify(contract_addresses, undefined, 2)
   
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});