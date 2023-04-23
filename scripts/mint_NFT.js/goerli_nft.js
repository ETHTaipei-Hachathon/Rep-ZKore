const proof_json = require("../../document/temp_proof.json");
async function main() {
  const ZKoreAddress = "0x41bdD91a8954396bFF423c80dc3d8AaC22d49a8C";

  let zkore = await hre.ethers.getContractAt("ZKore", ZKoreAddress);

  try {
    // await zkore.superMint("0xF16Aa7E201651e7eAd5fDd010a5a14589E220826").then(function(id) {
    //     console.log("id:", id);
    // });
    // let balance = await zkore.balanceOf("0xF16Aa7E201651e7eAd5fDd010a5a14589E220826");
    // console.log(balance);
    // let url = await zkore.tokenURI(0)
    // console.log(url);
    console.log(proof_json)
    await zkore.safeMint(
      "0xF16Aa7E201651e7eAd5fDd010a5a14589E220826",
      proof_json[0],
      proof_json[1],
      proof_json[2],
      proof_json[3]
    ).then(function(result) {
      console.log(result);
    });
    let balance = await zkore.balanceOf("0xF16Aa7E201651e7eAd5fDd010a5a14589E220826");
    console.log(balance);
    console.log("Request set");
  } catch (e) {
    console.log("error: ", e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
