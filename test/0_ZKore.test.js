const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { expect } = require("chai");

describe("ZKore", function () {
  beforeEach(async () => {
    ZKore = await ethers.getContractFactory("ZKore");
    [owner, user1, addr1, addr2, ...addrs] = await ethers.getSigners();
    zkore = await ZKore.deploy();
    await zkore.deployed();
  });

  it("should deploy the contract and set the correct name and symbol", async () => {
    const name = await zkore.name();
    const symbol = await zkore.symbol();
    expect(name).to.equal("ZKore");
    expect(symbol).to.equal("ZKORE");
  });

  it("should mint an NFT and set the correct tokenURI", async () => {
    await zkore.connect(user1).safeMint(user1.address);
    const tokenURI = await zkore.connect(user1).tokenURI(0);
    expect(tokenURI).to.equal("abc123");
  });

  it("should emit Safe Mint event when a user mint NFT", async () => {
    await expect(zkore.connect(user1).safeMint(user1.address))
      .to.emit(zkore, "SafeMint")
      .withArgs(user1.address, 0);
  });
});
