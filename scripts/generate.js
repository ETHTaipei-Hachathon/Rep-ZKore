const { groth16 } = require("snarkjs");
const { Identity } = require("@semaphore-protocol/identity")
const { Group } = require("@semaphore-protocol/group")
const { generateProof, verifyProof , packToSolidityProof} = require("@semaphore-protocol/proof")
const fs = require("fs");
const hre = require("hardhat");

async function main() {
    const SemaphoreAddress = "0xF02363A60b8Eedb20aaC15b7B75215999FDa6338";
  
    let semaphore = await hre.ethers.getContractAt("Semaphore", SemaphoreAddress);
  
    try {
        let identity
        const password = "EricAllenRoy"
        identity = new Identity(password)
        const addNewMember = await semaphore.addMember(2, identity.commitment)
        await addNewMember.wait()
        console.log("add member")

        // generate proof   
        const group = new Group(16, BigInt(1))
        group.addMember(identity.commitment)
        const frontendExternalNullifier = group.root
        
        const greeting = "0x000000000000000000000000000000000000000000000000000000000000007b"

        const fullProof = await generateProof(identity, group, frontendExternalNullifier, greeting, {
            zkeyFilePath: "./semaphore_file/semaphore.zkey",
            wasmFilePath: "./semaphore_file/semaphore.wasm"
        })

        
        
        // process proof 
        const proof = packToSolidityProof(fullProof.proof)
        const { merkleRoot, nullifierHash, signalHash, externalNullifier} = fullProof.publicSignals

        const calldata = await groth16.exportSolidityCallData(fullProof.proof,[merkleRoot, nullifierHash, signalHash, externalNullifier])
        args = JSON.parse("[" + calldata + "]")
        console.log(args)

        
        const contractsDir = __dirname + "/../document";
          
        if (!fs.existsSync(contractsDir)) {
              fs.mkdirSync(contractsDir);
            }
          
        fs.writeFileSync(
              contractsDir + `/temp_proof.json`,
              JSON.stringify(args, undefined, 2)
             
            );
          }
        
    catch (e) {
      console.log("error: ", e);
    }
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  