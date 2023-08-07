// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");

const redeemLockedCollateral = async () => {

  console.log("here1");

  const redeemLockedCollateralAbi = [
      "function redeemLockedCollateral(address _manager, uint256 _positionId, bytes calldata _data)"
  ];
  const redeemLockedCollateralIFace = new ethers.utils.Interface(redeemLockedCollateralAbi);
  const redeemLockedCollateral = redeemLockedCollateralIFace.encodeFunctionData("redeemLockedCollateral", [
      "0xb8BB3303830afef24924E01107E95e490Ac17016", //Position Manager
      "2", //positionId uint256
      "0x00",
  ])
  console.log("below is the encoded data");
  console.log(redeemLockedCollateral);
  console.log("here2");
}

module.exports = async function(deployer) {
  await redeemLockedCollateral();
};