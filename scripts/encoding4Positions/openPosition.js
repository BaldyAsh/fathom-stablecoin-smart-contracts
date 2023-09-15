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
      "0x762348d386afa72c9C3E7D4CDc59659D2572b68c", //Position Manager
      "0xEB3643578beC34D3194961fB1d263e3568da9aC8", // StabilityFeeCollector
      "0xf7BBB8EFb3C0122759f9066449fb395022543107", //AnkrCollateralAdapter
      "0xcDFdCB3B4CdC94F4a4216dCf339a95b69d56824A", // StablecoinAdapter
      collateral_pool_id,
      stablecoinAmount, // wad
      "0x00",
  ])
  console.log("below is the encoded data");
  console.log(openPositionCall);
  console.log("here2");
}

module.exports = async function(deployer) {
  await openPositionAndDraw(COLLATERAL_POOL_ID, WeiPerWad.mul(5000));
};