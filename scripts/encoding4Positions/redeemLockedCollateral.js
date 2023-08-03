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
      "0xCc42170fc2920d992BaE63f3a92003E61a322fc6", //Position Manager
      "3", //positionId uint256
      "0x00",
  ])
  console.log("below is the encoded data");
  console.log(redeemLockedCollateral);
  console.log("here2");
}

module.exports = async function(deployer) {
  await redeemLockedCollateral();
};