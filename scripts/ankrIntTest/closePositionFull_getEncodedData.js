// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");
// const MaxUint256 = require("@ethersproject/constants");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { AliceAddress } = require("../tests/helper/address");

const { WeiPerWad } = require("../tests/helper/unit");


const wipeAllAndUnlockXDC = async (positionId, collateralAmount) => {
  const wipeAllAndUnlockXDCAbi = [
      "function wipeAllAndUnlockXDC(address _manager, address _xdcAdapter, address _stablecoinAdapter, uint256 _positionId, uint256 _collateralAmount, bytes calldata _data)"
  ];
  const wipeAllAndUnlockXDCIFace = new ethers.utils.Interface(wipeAllAndUnlockXDCAbi);
  const closePositionCall = wipeAllAndUnlockXDCIFace.encodeFunctionData("wipeAllAndUnlockXDC", [
      "0xc0d55c7EC712786d6d474F53F1bde91E0D25D514", //Position Manager
      "0xa903235C2f95D4a2a1Ece086a5eFad872d19aF7F", // collateralTokenAdapter
      "0xc1690b7Ef55D15F5cBc488f07dDb5017b6F66db7", // StablecoinAdapter
      positionId,
      collateralAmount, // wad
      "0x00",
  ])

  console.log("below is the positionFullClosure script");
  console.log(closePositionCall);

}

module.exports = async function(deployer) {

  await wipeAllAndUnlockXDC(2, WeiPerWad.mul(20));
  console.log("below is poolId")
  console.log(COLLATERAL_POOL_ID);
  
};