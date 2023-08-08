// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { WeiPerWad } = require("../tests/helper/unit");


const openPositionAndDraw = async (collateral_pool_id, stablecoinAmount) => {

  console.log("here1");

  const openLockXDCAndDrawAbi = [
      "function openLockXDCAndDraw(address _manager, address _stabilityFeeCollector, address _xdcAdapter, address _stablecoinAdapter, bytes32 _collateralPoolId, uint256 _stablecoinAmount, bytes calldata _data)"
  ];
  const openLockTokenAndDrawIFace = new ethers.utils.Interface(openLockXDCAndDrawAbi);
  const openPositionCall = openLockTokenAndDrawIFace.encodeFunctionData("openLockXDCAndDraw", [
    "0x2fE84707e907eaB4C4E6a91CCe458E648be390Ae", //Position Manager
    "0x00f093e0E188dA1711a18fd5BF7468aea706888C", // StabilityFeeCollector
    "0x2fc7e65023aFF27FA61A573B5C8E3fDe3CE9ef79", //AnkrCollateralAdapter
    "0xE3b248A97E9eb778c9B08f20a74c9165E22ef40E", // StablecoinAdapter
      collateral_pool_id,
      stablecoinAmount, // wad
      "0x00",
  ])
  console.log("below is the encoded data");
  console.log(openPositionCall);
  console.log("here2");
}

module.exports = async function(deployer) {
  await openPositionAndDraw(COLLATERAL_POOL_ID, WeiPerWad.mul(5));
};