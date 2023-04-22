async function main() {
    const ZKoreAddress = "0x046550482B6bfDBfF8d129b81e2A36585ce68735";
  
    let zkore = await hre.ethers.getContractAt("ZKore", ZKoreAddress);
  
    try {
      await zkore.superMint("0xF16Aa7E201651e7eAd5fDd010a5a14589E220826").then(function(id) {
          console.log("id:", id);
      });
      let balance = await zkore.balanceOf("0xF16Aa7E201651e7eAd5fDd010a5a14589E220826");
      console.log(balance);
      let url = await zkore.tokenURI(0);
      console.log(url);
  
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
  