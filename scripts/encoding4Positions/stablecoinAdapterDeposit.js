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
      "0x40A3ecc81A3bC15Bd5A5c92d252BE4481f7f2902", // stablecoinAdapter
      "0x693fa9d072f50E4CAA0cee834f04ce277226b288", // systemDebtEngine
      WeiPerWad.mul(30), // stablecoinAmount
      "0x00"    //stablecoinAmount
  ])
  console.log("below is the encoded data");
  console.log(stablecoinAdapterDeposit);
  console.log("here2");
}

module.exports = async function(deployer) {
  await stablecoinAdapterDeposit();
};