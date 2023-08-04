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
      "0xb8BB3303830afef24924E01107E95e490Ac17016", //Position Manager
      "0x5C1a1d26702576A461a63f65cA8b5CC0072f6487", // StabilityFeeCollector
      "0x066c87701CeDA5741e26d4E722792B44CC6A17a6", //AnkrCollateralAdapter
      "0xA11970336211310B063a117434337AE7ccA1FB67", // StablecoinAdapter
      collateral_pool_id,
      stablecoinAmount, // wad
      "0x00",
  ])
  console.log("below is the encoded data");
  console.log(openPositionCall);
  console.log("here2");
}

module.exports = async function(deployer) {
  await openPositionAndDraw(COLLATERAL_POOL_ID, WeiPerWad.mul(75));
};