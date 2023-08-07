// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");

const { WeiPerWad } = require("../tests/helper/unit");


const whitelist = async () => {

  console.log("here1");

  const whitelistAbi = [
      "function whitelist(address _bookKeeper, address _showStopper)"
  ];
  const whitelistIFace = new ethers.utils.Interface(whitelistAbi);
  const whitelist = whitelistIFace.encodeFunctionData("whitelist", [
      "0x229b55d340be4aef8fF5FFd6aeaC17440b13d330", // bookKeeper
      "0xDb73522c3F563172362cAA33b40E53738C178926", // showStopper
  ])
  console.log("below is the encoded data");
  console.log(whitelist);
  console.log("here2");
}

module.exports = async function(deployer) {
  await whitelist();
};