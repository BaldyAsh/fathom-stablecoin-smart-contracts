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
    "0x342a959a1969cf71DECE2016738616661ff57a50", //Position Manager
    "0x50D6B1a28306F7805D585Dc95368d544522D2D50", // StabilityFeeCollector
    "0x5eE2F5402278DafEe9169C2399B16ceBe6983779", //AnkrCollateralAdapter
    "0x6a49D524dC28ca9736b1D3197F558f334C81440f", // StablecoinAdapter
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