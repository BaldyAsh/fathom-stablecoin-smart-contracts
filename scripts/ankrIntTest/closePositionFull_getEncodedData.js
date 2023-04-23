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
    "0x7aD16A04cC612d2Ab1fDE424B214a3C36c49E61b", //Position Manager
    "0x5eC92B5E8527d0C28282d230059E48093aaE9f82", //colTokenAdapter
    "0xeDDe504B30b8231f8f6f50f4eB5f7b8B4136d18b", // StablecoinAdapter
      positionId,
      collateralAmount, // wad
      "0x00",
  ])

  console.log(closePositionCall);

}

module.exports = async function(deployer) {

  await wipeAllAndUnlockXDC(1, WeiPerWad.mul(38300000));

  
  
};