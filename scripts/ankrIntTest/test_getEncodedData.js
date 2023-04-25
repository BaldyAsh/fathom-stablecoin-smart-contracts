// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { AliceAddress } = require("../tests/helper/address");

const { WeiPerWad } = require("../tests/helper/unit");


const testEncodedData = async () => {

  console.log("here1");

  const testAbi = [
      "function test()"
  ];
  const testAbiIFACE = new ethers.utils.Interface(testAbi);
  const testCALL = testAbiIFACE.encodeFunctionData("test", [
  ])
  console.log("below is the encoded data");
  console.log(testCALL);
  // console.log("here2");
  // await proxyWallet.execute2(fathomStablecoinProxyActions.address, openPositionCall, { from: from, value: ethers.constants.WeiPerEther })
}

module.exports = async function(deployer) {
  await testEncodedData();
};