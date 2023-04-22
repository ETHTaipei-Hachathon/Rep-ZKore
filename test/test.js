const { expect } = require("chai")
const { groth16 } = require("snarkjs");
const { Identity } = require("@semaphore-protocol/identity")
const { Group } = require("@semaphore-protocol/group")
const { generateProof, verifyProof , packToSolidityProof} = require("@semaphore-protocol/proof")
const { poseidonContract} =  require("circomlibjs")
const fs = require('fs')

let semaphore 

describe("deploy contract", () => {

    beforeEach(async() => {
        // Incremental merkletree deploy 
        const poseidonT3ABI = poseidonContract.generateABI(2)
        const poseidonT3Bytecode = poseidonContract.createCode(2)

        // Set deployer 
        const [deployer, signer] = await ethers.getSigners()

        const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, signer)
        const poseidonT3Lib = await PoseidonLibT3Factory.deploy()

        await poseidonT3Lib.deployed()

        const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
                libraries: {
                    PoseidonT3: poseidonT3Lib.address
            }
        })

        nft2 = poseidonT3Lib.address
        const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()
        await incrementalBinaryTreeLib.deployed()

        // Semaphore deploy 
        const verifier16 = await ethers.getContractFactory("Verifier16")
        const Semaphore = await ethers.getContractFactory("Semaphore", {
        libraries: {
                IncrementalBinaryTree: incrementalBinaryTreeLib.address
            }
        })
        const verifier = await verifier16.deploy()
        console.log(`Successful deploy verifier address in :  ${verifier.address}`)

        // deploy semaphore
        semaphore = await Semaphore.deploy("16",verifier.address)

        console.log(`Semaphore contract has been deployed to: ${semaphore.address}`)

    })

    it('Successful save to group and verify the proof', async() => {
        
        const [deployer] = await ethers.getSigners()
        // Create 1 group 
        const transactionGroup1 = await semaphore.connect(deployer).createGroup(1, 16, BigInt(1), deployer.address)
        await transactionGroup1.wait()
        
        // Create 2 group
        const transactionGroup2 = await semaphore.connect(deployer).createGroup(2, 16, BigInt(1), deployer.address)
        await transactionGroup2.wait()

        // Set account and name, password  
        const password1 = "Bob"
        identity1 = new Identity(password1)

        const password2 = "Alice"
        identity2 = new Identity(password2)


        // add to group
        const addNewMember = await semaphore.connect(deployer).addMember(1, identity1.commitment)
        await addNewMember.wait()
        console.log("add member")

        // generate proof   
        const group = new Group(16, BigInt(1))
        group.addMember(identity1.commitment)
        const frontendExternalNullifier = group.root
        
        const greeting = "0x000000000000000000000000000000000000000000000000000000000000007b"

        const fullProof = await generateProof(identity1, group, frontendExternalNullifier, greeting, {
            zkeyFilePath: "./semaphore_file/semaphore.zkey",
            wasmFilePath: "./semaphore_file/semaphore.wasm"
        })

        console.log(fullProof)
        
        // process proof 
        const proof = packToSolidityProof(fullProof.proof)
        const { merkleRoot, nullifierHash, signalHash, externalNullifier} = fullProof.publicSignals

        const calldata = await groth16.exportSolidityCallData(fullProof.proof,[merkleRoot, nullifierHash, signalHash, externalNullifier])
        args = JSON.parse("[" + calldata + "]")
        console.log(args)
        
        // verify proof onchain 
        const transaction1 = await semaphore.connect(deployer).verifyProof(1, merkleRoot, greeting, nullifierHash, externalNullifier, proof)
        await transaction1.wait()
        console.log("Solidity on chain:", "pass")

        
        // verify proof offchain 
        const verificationKey = JSON.parse(fs.readFileSync("./semaphore_file/semaphore.json", "utf-8"))
        const pass = await verifyProof(verificationKey, fullProof).then(v => v.toString())
        console.log("javascript off chain:", pass)
    })
})

