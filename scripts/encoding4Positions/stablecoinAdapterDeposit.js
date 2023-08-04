// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");

const { WeiPerWad } = require("../tests/helper/unit");


const stablecoinAdapterDeposit = async () => {

  console.log("here1");

  const stablecoinAdapterDepositAbi = [
      "function stablecoinAdapterDeposit(address _adapter, address _positionAddress, uint256 _stablecoinAmount, bytes calldata _data)"
  ];
  const stablecoinAdapterDepositIFace = new ethers.utils.Interface(stablecoinAdapterDepositAbi);
  const stablecoinAdapterDeposit = stablecoinAdapterDepositIFace.encodeFunctionData("stablecoinAdapterDeposit", [
      "0xA11970336211310B063a117434337AE7ccA1FB67", // stablecoinAdapter
      "0x9E7D0738EA9942CA9E66185ACd59ca2d7b92B694", // systemDebtEngine
      WeiPerWad.mul(150), // stablecoinAmount
      "0x00"    //stablecoinAmount
  ])
  console.log("below is the encoded data");
  console.log(stablecoinAdapterDeposit);
  console.log("here2");
}

module.exports = async function(deployer) {
  await stablecoinAdapterDeposit();
};