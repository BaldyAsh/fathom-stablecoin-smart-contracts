// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { AliceAddress } = require("../tests/helper/address");

const { WeiPerWad } = require("../tests/helper/unit");


const openPositionAndDraw = async (collateral_pool_id, stablecoinAmount) => {

  console.log("here1");

  const openLockXDCAndDrawAbi = [
      "function openLockXDCAndDraw(address _manager, address _stabilityFeeCollector, address _xdcAdapter, address _stablecoinAdapter, bytes32 _collateralPoolId, uint256 _stablecoinAmount, bytes calldata _data)"
  ];
  const openLockTokenAndDrawIFace = new ethers.utils.Interface(openLockXDCAndDrawAbi);
  const openPositionCall = openLockTokenAndDrawIFace.encodeFunctionData("openLockXDCAndDraw", [
      "0xc0d55c7EC712786d6d474F53F1bde91E0D25D514", //Position Manager
      "0x31F550A517C5951E33A6927Baf6843BD86927a0f", // StabilityFeeCollector
      "0xa903235C2f95D4a2a1Ece086a5eFad872d19aF7F", // collateralTokenAdapter
      "0xc1690b7Ef55D15F5cBc488f07dDb5017b6F66db7", // StablecoinAdapter
      collateral_pool_id,
      stablecoinAmount, // wad
      "0x00",
  ])
  console.log("below is the encoded data");
  console.log(openPositionCall);
  // console.log("here2");
  // await proxyWallet.execute2(fathomStablecoinProxyActions.address, openPositionCall, { from: from, value: ethers.constants.WeiPerEther })
  // coralX execute --network development --path scripts/ankrIntTest/positionOpening_getEncodedData.js

}

module.exports = async function(deployer) {
  await openPositionAndDraw(COLLATERAL_POOL_ID, WeiPerWad.mul(10));
};